// The mushaf's pages, turned as on the website (its page-flip library): the page is held at its spine
// (its right edge) and its corner lifts and folds over, following the finger - the fold runs half way
// between the corner and the finger; the part folded over shows the back of the page (the page seen
// through it, mirrored, with a silvery sheen) and the corner it uncovers shows the next page, shaded
// along the fold. A swipe to the right (or a tap at the left edge) brings the next page; to the left
// (or a tap at the right edge), the previous page folds back over. Let go part way, it finishes or falls
// back. Drawn with Skia on the phone's graphics side, so the fold follows the finger at full speed.
//
// Two fingers zoom in on the page (up to 4×, around the point between them) and out again, as on the
// website (src/reader/pinch.js); zoomed in, one finger moves the page around and nothing turns (a tap
// still opens an ayah). Back to the whole page: pinching out, the app's «whole page» button
// (`unzoom`), or any change of page. In full screen the page is cut as on the website (src/lib/crop.ts).
// On the page read: the highlighted ayat in their colours, the chosen one in gold, and the comments'
// badges in the margin (a tap on one opens its comment).
//
// Where the fold is: the corner's position `px, py` (the page's own coordinates), which corner (top or
// bottom: where the finger started) and which way (`mode`: 1 forward, -1 back, 0 at rest). The pictures
// of the page before, the page read and the page after are in `prev`, `cur`, `next`; when a turn ends,
// the page shown is already the new one before the app hears of it, so nothing flickers.
import { Canvas, Group, LinearGradient, Morphology, Path, Rect, RoundedRect, Skia, Image as SkiaImage, type SkImage, type SkPath } from '@shopify/react-native-skia';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import {
  GestureDetector,
  useCompetingGestures,
  useExclusiveGestures,
  useLongPressGesture,
  usePanGesture,
  usePinchGesture,
  useTapGesture,
} from 'react-native-gesture-handler';
import { Easing, useAnimatedReaction, useDerivedValue, useSharedValue, withSequence, withTiming, type DerivedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ayahAt } from '@/lib/boxes';
import { cropOf } from '@/lib/crop';
import { TOTAL_PAGES } from '@/lib/quran';
import { pageUrl } from '@/lib/remote';
import { useTheme } from '@/theme/theme';

export type Chosen = { s: number; a: number; boxes: number[][] };
export type Marked = Chosen & { color: string };
// a comment's badge: where (fractions of the page picture), and its note's colour
export type Pin = { s: number; a: number; x: number; y: number; color: string };

// the website's badge (notes.js), in thousandths of the page's width: a speech bubble with two lines
const BUBBLE = 'M-17 -15h34a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4h-20l-9 9v-9h-5a4 4 0 0 1-4-4v-18a4 4 0 0 1 4-4z';
const BUBBLE_LINES = 'M-10 -5h20M-10 2h13';

type Props = {
  page: number;
  width: number; // the room for the pages
  height: number;
  pageW: number; // the page itself, centred in the room
  pageH: number;
  full: boolean; // full screen: the page cut to its text (src/lib/crop.ts)
  chosen: Chosen[]; // the chosen ayah's parts on the page read
  marks: Marked[]; // the highlighted ayat on the page read, each in its colour
  pins: Pin[]; // the comments' badges in the page's margin
  onPin: (s: number, a: number) => void; // a badge tapped
  unzoom: number; // changed by the app: back to the whole page
  onTurned: (page: number) => void; // a turn finished: the page now read
  onAyah: (s: number, a: number, x: number, y: number) => void; // x, y: where the finger was, in the room
  onEmptyTap: () => void; // a tap on the page outside its ayat and edges
  onZoomed: (zoomed: boolean) => void;
  // the wird: holding an ayah (longer than a tap) marks where the reader stopped; the stop's ayah on
  // this page, tinted with a soft wash (null: none here)
  onHold?: (s: number, a: number) => void;
  ribbon?: Chosen | null;
  // Tasmee (Recite): parts of the page covered with the paper's own colour, so the words under them cannot be read.
  // Boxes are fractions of the page picture, like `chosen`.
  veils?: Record<number, { boxes: number[][] }[] | undefined>;
};

type Poly = number[][];
type Fold = { mx: number; my: number; nx: number; ny: number };

// The part of a polygon on one side of the fold: side 1 where (X - M)·n >= 0 (the page still flat),
// side -1 where it is <= 0 (the corner lifted off it) - Sutherland-Hodgman
function cut(poly: Poly, f: Fold, side: number): Poly {
  'worklet';
  const out: Poly = [];
  const at = (p: number[]) => ((p[0] - f.mx) * f.nx + (p[1] - f.my) * f.ny) * side;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const da = at(a);
    const db = at(b);
    if (da >= 0) out.push(a);
    if (da >= 0 !== db >= 0) {
      const k = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    }
  }
  return out;
}

function toPath(poly: Poly) {
  'worklet';
  const path = Skia.PathBuilder.Make();
  poly.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
  if (poly.length) path.close();
  return path.detach();
}

// where a page's picture is drawn so the part shown (src/lib/crop.ts) fills the page w × h
function placeOf(page: number, full: boolean, w: number, h: number) {
  'worklet';
  const c = cropOf(page, full);
  return { x: (-c.x / c.w) * w, y: (-c.y / c.h) * h, width: w / c.w, height: h / c.h };
}

const FINGER = 1.7; // how much further the corner goes than the finger
const DONE = 0.28; // past this share of the turn, letting go finishes it
const MAX_ZOOM = 4;
const NOTHING: Poly = [];

type CoverRole = 'under' | 'over';
type Picture = DerivedValue<SkImage | null>; // `under` or `over`
type Place = DerivedValue<ReturnType<typeof placeOf>>; // `underAt` or `overAt`

// Tasmee's cover of one page: the page's own picture drawn again inside the covered boxes through a dilate filter,
// so the ink goes and the paper's own tone is left. It shows only while that page is the one drawn in its role:
// 'under' (the page the turn uncovers) or 'over' (the page turning, and its back).
function Cover({ page, path, role, at, mode, image, rect, pageW, pageH, paper }: {
  page: number;
  path: SkPath;
  role: CoverRole;
  at: { get(): number };
  mode: { get(): number };
  image: Picture;
  rect: Place;
  pageW: number;
  pageH: number;
  paper: string;
}) {
  const opacity = useDerivedValue(() => {
    const m = mode.get();
    const drawn = role === 'under' ? at.get() + (m === 1 ? 1 : 0) : at.get() - (m === -1 ? 1 : 0);
    return drawn === page ? 1 : 0;
  });
  return (
    <Group clip={path} opacity={opacity}>
      <Rect x={0} y={0} width={pageW} height={pageH} color={paper} />
      <SkiaImage image={image} rect={rect} fit="fill">
        <Morphology operator="dilate" radius={Math.max(4, pageW * 0.02)} />
      </SkiaImage>
    </Group>
  );
}

// The marks on one page (highlights, the chosen ayah, comment badges, the pin). Each page's marks are their own copy,
// made for that page and drawn only while that page is the one on screen. Skia and the page picture are updated on the
// graphics side at once when a turn ends, the marks a moment later (the app has to render first); because this copy
// compares the page on screen with the page it was made for, the previous page's marks can never show on the next page.
function Overlay({ mine, at, mode, children }: { mine: number; at: { get(): number }; mode: { get(): number }; children: ReactNode }) {
  const opacity = useDerivedValue(() => (mode.get() === -1 || at.get() !== mine ? 0 : 1));
  return <Group opacity={opacity}>{children}</Group>;
}

export function PageCurl({ page, width, height, pageW, pageH, full, chosen, marks, pins, unzoom, onTurned, onAyah, onPin, onEmptyTap, onZoomed, onHold, ribbon, veils }: Props) {
  const { c, isDark } = useTheme();
  // night: the page always a little dimmer (its colours never changed); the choice in the settings is
  // only the screen around it in full screen (quran.tsx)
  const dimmed = isDark;
  const paper = c.paper;
  const ox = (width - pageW) / 2;
  const oy = (height - pageH) / 2;

  // the page's size, the page read, full screen or not, the fold
  const W = useSharedValue(pageW);
  const H = useSharedValue(pageH);
  const at = useSharedValue(page); // the page drawn (a finished turn moves it at once)
  const isFull = useSharedValue(full);
  const px = useSharedValue(0);
  const py = useSharedValue(pageH);
  const cy = useSharedValue(pageH); // the corner held: the bottom one (pageH) or the top one (0)
  const mode = useSharedValue(0);
  const prev = useSharedValue<SkImage | null>(null);
  const cur = useSharedValue<SkImage | null>(null);
  const next = useSharedValue<SkImage | null>(null);
  // the zoom: the scale, and how far the scaled page is moved (from the page's top-left corner)
  const zs = useSharedValue(1);
  const zx = useSharedValue(0);
  const zy = useSharedValue(0);

  useEffect(() => {
    W.set(pageW);
    H.set(pageH);
    isFull.set(full);
    if (mode.get() === 0) {
      cy.set(pageH);
      py.set(pageH);
    }
  }, [pageW, pageH, full, W, H, isFull, cy, py, mode]);

  // ---------- the pictures: the pages around the one read, loaded once and kept while near ----------
  const images = useRef(new Map<number, SkImage | null>());
  const loading = useRef(new Set<number>());
  const reading = useRef(page);
  useEffect(() => {
    reading.current = page;
    at.set(page);
    const show = () => {
      const p = reading.current;
      prev.set(images.current.get(p - 1) ?? null);
      cur.set(images.current.get(p) ?? null);
      next.set(images.current.get(p + 1) ?? null);
    };
    show();
    for (const p of [page, page + 1, page - 1, page + 2, page - 2]) {
      if (p < 1 || p > TOTAL_PAGES || images.current.has(p) || loading.current.has(p)) continue;
      loading.current.add(p);
      Skia.Data.fromURI(pageUrl(p))
        .then((data) => images.current.set(p, Skia.Image.MakeImageFromEncoded(data)))
        .catch(() => {})
        .finally(() => {
          loading.current.delete(p);
          if (Math.abs(p - reading.current) <= 1) show();
        });
    }
    for (const p of [...images.current.keys()]) if (Math.abs(p - page) > 3) images.current.delete(p);
  }, [page, at, prev, cur, next]);

  // ---------- the fold ----------

  // the corner, where the finger takes it - but the page stays held at its spine: the corner can be no
  // further from the spine's end on its side than the page is wide, nor from the other end than the
  // page's diagonal
  const corner = useDerivedValue(() => {
    const w = W.get();
    const h = H.get();
    const sy = cy.get();
    let x = px.get();
    let y = py.get();
    let d = Math.hypot(x - w, y - sy);
    if (d > w) {
      x = w + ((x - w) * w) / d;
      y = sy + ((y - sy) * w) / d;
    }
    const fy = sy === 0 ? h : 0;
    const diag = Math.hypot(w, h);
    d = Math.hypot(x - w, y - fy);
    if (d > diag) {
      x = w + ((x - w) * diag) / d;
      y = fy + ((y - fy) * diag) / d;
    }
    return { x, y };
  });

  // the fold line: half way between the corner's place and where it is now, across the line joining them
  const fold = useDerivedValue((): Fold | null => {
    const { x, y } = corner.get();
    const vy = y - cy.get();
    const len = Math.hypot(x, vy);
    if (mode.get() === 0 || len < 0.5) return null;
    return { mx: x / 2, my: cy.get() + vy / 2, nx: x / len, ny: vy / len };
  });
  const rect = useDerivedValue((): Poly => [
    [0, 0],
    [W.get(), 0],
    [W.get(), H.get()],
    [0, H.get()],
  ]);
  const whole = useDerivedValue(() => Skia.XYWHRect(0, 0, W.get(), H.get()));
  // the page turning, as much of it as still lies flat
  const flat = useDerivedValue(() => {
    const f = fold.get();
    return toPath(f ? cut(rect.get(), f, 1) : rect.get());
  });
  // the corner it uncovers (the page under shows there)
  const uncovered = useDerivedValue(() => {
    const f = fold.get();
    return toPath(f ? cut(rect.get(), f, -1) : NOTHING);
  });
  // the part folded over: the uncovered corner, mirrored across the fold (row by row: a b tx / c d ty)
  const mirror = useDerivedValue(() => {
    const f = fold.get();
    if (!f) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const d = 2 * (f.mx * f.nx + f.my * f.ny);
    return [1 - 2 * f.nx * f.nx, -2 * f.nx * f.ny, d * f.nx, -2 * f.nx * f.ny, 1 - 2 * f.ny * f.ny, d * f.ny, 0, 0, 1];
  });
  // what the flap shows: as on the website, the page's back is the page itself turned over (mirrored
  // from side to side), laid across the fold with the flap
  const backSide = useDerivedValue(() => {
    const [a, b, tx, cc, d, ty] = mirror.get();
    const w = W.get();
    return [-a, b, a * w + tx, -cc, d, cc * w + ty, 0, 0, 1];
  });
  const flap = useDerivedValue(() => {
    const f = fold.get();
    if (!f) return toPath(NOTHING);
    const m = mirror.get();
    return toPath(cut(rect.get(), f, -1).map(([x, y]) => [m[0] * x + m[1] * y + m[2], m[3] * x + m[4] * y + m[5]]));
  });

  // the shades: on the page under, darkest at the fold; on the flat page, a little by the fold; the
  // flap's sheen, bright at the fold, greyer towards its corner
  const foldAt = useDerivedValue(() => {
    const f = fold.get();
    return f ? { x: f.mx, y: f.my } : { x: 0, y: 0 };
  });
  const underShadeEnd = useDerivedValue(() => {
    const f = fold.get();
    return f ? { x: f.mx - f.nx * 38, y: f.my - f.ny * 38 } : { x: 1, y: 1 };
  });
  const flatShadeEnd = useDerivedValue(() => {
    const f = fold.get();
    return f ? { x: f.mx + f.nx * 30, y: f.my + f.ny * 30 } : { x: 1, y: 1 };
  });

  // which picture is where: going forward, the page read turns over the next one; going back, the
  // previous page folds back over the page read (each drawn with its own cut in full screen)
  const under = useDerivedValue(() => (mode.get() === 1 ? next.get() : cur.get()));
  const over = useDerivedValue(() => (mode.get() === -1 ? prev.get() : cur.get()));
  const underAt = useDerivedValue(() => placeOf(at.get() + (mode.get() === 1 ? 1 : 0), isFull.get(), W.get(), H.get()));
  const overAt = useDerivedValue(() => placeOf(at.get() - (mode.get() === -1 ? 1 : 0), isFull.get(), W.get(), H.get()));

  // the zoom: the page scaled and moved, cut to its own place while zoomed in
  const zoomMove = useDerivedValue(() => [{ translateX: ox + zx.get() }, { translateY: oy + zy.get() }, { scale: zs.get() }]);
  const zoomClip = useDerivedValue(() =>
    zs.get() > 1.001 ? Skia.XYWHRect(ox, oy, W.get(), H.get()) : Skia.XYWHRect(-width, -height, width * 3, height * 3),
  );
  useAnimatedReaction(
    () => zs.get() > 1.001,
    (now, before) => {
      if (now !== before) scheduleOnRN(onZoomed, now);
    },
  );

  // ---------- turning ----------

  // the turn over: the pictures move along at once (the app's own update comes a moment later)
  const settle = (forward: boolean, finished: boolean) => {
    'worklet';
    if (finished) {
      const now = at.get() + (forward ? 1 : -1);
      if (forward) {
        prev.set(cur.get());
        cur.set(next.get());
        next.set(null);
      } else {
        next.set(cur.get());
        cur.set(prev.get());
        prev.set(null);
      }
      at.set(now);
      scheduleOnRN(onTurned, now);
    }
    mode.set(0);
    px.set(0);
    py.set(cy.get());
  };

  // the corner goes all the way over (or back to where it was), then the turn settles
  const finish = (forward: boolean, complete: boolean) => {
    'worklet';
    const w = W.get();
    const goal = forward === complete ? 2 * w : 0;
    const duration = Math.max(200, Math.min(640, (Math.abs(goal - px.get()) / (2 * w)) * 860));
    const ease = Easing.out(Easing.cubic);
    py.set(withTiming(cy.get(), { duration, easing: ease }));
    px.set(
      withTiming(goal, { duration, easing: ease }, (done) => {
        if (done) settle(forward, complete);
      }),
    );
  };

  const begin = (forward: boolean, bottom: boolean) => {
    'worklet';
    const h = H.get();
    cy.set(bottom ? h : 0);
    mode.set(forward ? 1 : -1);
    px.set(forward ? 0 : 2 * W.get());
    py.set(bottom ? h : 0);
  };

  // zoomed in, the scaled page always covers its place: never a gap at an edge
  const keepCovering = () => {
    'worklet';
    const k = zs.get();
    zx.set(Math.min(0, Math.max(W.get() * (1 - k), zx.get())));
    zy.set(Math.min(0, Math.max(H.get() * (1 - k), zy.get())));
  };
  const toWhole = () => {
    'worklet';
    const ease = { duration: 250, easing: Easing.out(Easing.cubic) };
    zs.set(withTiming(1, ease));
    zx.set(withTiming(0, ease));
    zy.set(withTiming(0, ease));
  };

  // One finger: zoomed in, it moves the page around; otherwise it turns the page - right brings the next
  // page, left the previous one, the corner nearest where it started (a mostly upright move does
  // nothing). What it does is read from its first move (at the start, the browser preview gives no move
  // yet). `finger`: 0 nothing, 1 waiting for that first move, 2 turning the page, 3 moving the zoomed page
  const finger = useSharedValue(0);
  const moveFrom = useSharedValue({ x: 0, y: 0 });
  const drag = usePanGesture({
    maxPointers: 1,
    activeOffsetX: [-12, 12],
    activeOffsetY: [-12, 12],
    onActivate: () => {
      finger.set(mode.get() === 0 ? 1 : 0);
    },
    onUpdate: (e) => {
      if (finger.get() === 1 && (e.translationX !== 0 || e.translationY !== 0)) {
        if (zs.get() > 1.001) {
          finger.set(3);
          moveFrom.set({ x: zx.get() - e.translationX, y: zy.get() - e.translationY });
        } else if (Math.abs(e.translationX) < Math.abs(e.translationY)) {
          finger.set(0);
        } else {
          const forward = e.translationX > 0;
          const p = at.get();
          const can = forward ? p < TOTAL_PAGES : p > 1;
          finger.set(can ? 2 : 0);
          if (can) begin(forward, e.y - e.translationY > height / 2);
        }
      }
      if (finger.get() === 3) {
        zx.set(moveFrom.get().x + e.translationX);
        zy.set(moveFrom.get().y + e.translationY);
        keepCovering();
        return;
      }
      if (finger.get() !== 2) return;
      const m = mode.get();
      const w = W.get();
      const h = H.get();
      const travel = Math.max(0, m * e.translationX * FINGER);
      // as on the website, the corner goes to the finger's height (gently over the first move, so it
      // does not jump), and rises a little more as it goes: the fold runs on the slant, as paper does
      const sy = cy.get();
      const ramp = Math.min(1, travel / 90);
      const lift = Math.min(h * 0.12, travel * 0.15) * (sy === 0 ? 1 : -1);
      px.set(m === 1 ? travel : 2 * w - travel);
      py.set(sy + (e.y - oy - sy) * ramp + lift);
    },
    onDeactivate: (e) => {
      const turning = finger.get() === 2;
      finger.set(0);
      if (!turning) return;
      const m = mode.get();
      const share = m === 1 ? px.get() / (2 * W.get()) : 1 - px.get() / (2 * W.get());
      const fling = m * e.velocityX > 700;
      finish(m === 1, share > DONE || fling);
    },
  });

  // ---------- zoom ----------

  // two fingers: the point of the page between them stays between them as the page grows or shrinks
  const pinchFrom = useSharedValue({ fresh: true, s: 1, x: 0, y: 0 });
  const pinch = usePinchGesture({
    onActivate: () => {
      pinchFrom.set({ fresh: true, s: 1, x: 0, y: 0 });
    },
    onUpdate: (e) => {
      if (mode.get() !== 0) return;
      if (pinchFrom.get().fresh) {
        const k = zs.get();
        pinchFrom.set({ fresh: false, s: k / e.scale, x: (e.focalX - ox - zx.get()) / k, y: (e.focalY - oy - zy.get()) / k });
      }
      const from = pinchFrom.get();
      const k = Math.min(MAX_ZOOM, Math.max(1, from.s * e.scale));
      zs.set(k);
      zx.set(e.focalX - ox - from.x * k);
      zy.set(e.focalY - oy - from.y * k);
      keepCovering();
    },
    onDeactivate: () => {
      if (zs.get() < 1.04) toWhole();
    },
  });

  // back to the whole page when the app asks, or on any change of page
  useEffect(() => {
    if (!unzoom) return;
    const ease = { duration: 250, easing: Easing.out(Easing.cubic) };
    zs.set(withTiming(1, ease));
    zx.set(withTiming(0, ease));
    zy.set(withTiming(0, ease));
  }, [unzoom, zs, zx, zy]);
  useEffect(() => {
    zs.set(1);
    zx.set(0);
    zy.set(0);
  }, [page, zs, zx, zy]);

  // ---------- taps ----------

  // a tap: an ayah, else the page's left edge (next) or right edge (previous), else the page itself
  // (zoomed in, the edges do not turn)
  const turnByTap = (forward: boolean) => {
    begin(forward, true);
    const ease = Easing.inOut(Easing.cubic);
    py.set(withSequence(withTiming(pageH * 0.84, { duration: 320, easing: ease }), withTiming(pageH, { duration: 360, easing: ease })));
    px.set(
      withTiming(forward ? 2 * pageW : 0, { duration: 680, easing: ease }, (done) => {
        if (done) settle(forward, true);
      }),
    );
  };
  const tap = useTapGesture({
    runOnJS: true,
    onActivate: (e) => {
      if (mode.get() !== 0) return;
      const k = zs.get();
      const fx = (e.x - ox - zx.get()) / k / pageW;
      const fy = (e.y - oy - zy.get()) / k / pageH;
      const crop = cropOf(page, full);
      // a comment's badge first (it sits in the margin, beside its ayah)
      const pin = pins.find((p) => Math.hypot(((p.x - crop.x) / crop.w - fx) * pageW * k, ((p.y - crop.y) / crop.h - fy) * pageH * k) < 22);
      if (pin) return onPin(pin.s, pin.a);
      const inside = fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1;
      const hit = inside ? ayahAt(page, crop.x + fx * crop.w, crop.y + fy * crop.h) : null;
      if (hit) return onAyah(hit.s, hit.a, e.x, e.y);
      if (inside && k <= 1.001 && fx < 0.1 && page < TOTAL_PAGES) return turnByTap(true);
      if (inside && k <= 1.001 && fx > 0.9 && page > 1) return turnByTap(false);
      onEmptyTap();
    },
  });

  // the wird: a finger held still on an ayah (a move turns the page instead)
  const hold = useLongPressGesture({
    runOnJS: true,
    minDuration: 650,
    maxDistance: 12,
    enabled: !!onHold,
    onActivate: (e) => {
      if (!onHold || mode.get() !== 0) return;
      const k = zs.get();
      const fx = (e.x - ox - zx.get()) / k / pageW;
      const fy = (e.y - oy - zy.get()) / k / pageH;
      if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return;
      const crop = cropOf(page, full);
      const hit = ayahAt(page, crop.x + fx * crop.w, crop.y + fy * crop.h);
      if (hit) onHold(hit.s, hit.a);
    },
  });

  const pages = useExclusiveGestures(drag, hold, tap);
  const gesture = useCompetingGestures(pinch, pages);

  // the highlighted ayat and the chosen one, where their parts are on the page as shown (only on the
  // page read: hidden while the page before folds back over it); the comments' badges
  const shown = cropOf(page, full);
  const place = (e: Chosen, color: string) =>
    e.boxes.map(([x0, y0, x1, y1], i) => ({
      key: `${e.s}:${e.a}:${i}:${color}`,
      x: ((x0 - shown.x) / shown.w) * pageW,
      y: ((y0 - shown.y) / shown.h) * pageH,
      width: ((x1 - x0) / shown.w) * pageW,
      height: ((y1 - y0) / shown.h) * pageH,
      color,
    }));
  // Tasmee's cover: the page's own picture, drawn again inside the covered boxes through a dilate filter. A dilate
  // keeps the lightest colour around each point, so the ink (thin strokes) disappears and what is left is the
  // paper's own tone: seamless, whatever the page's colour is. One path holds all the boxes (one extra draw).
    // Tasmee's cover: one path per page given in `veils`, holding all the boxes of that page's cover
  const coverPaths = useMemo(() => {
    const out: { p: number; path: SkPath }[] = [];
    for (const key of Object.keys(veils ?? {})) {
      const p = Number(key);
      const list = veils?.[p];
      if (!list?.length) continue;
      const crop = cropOf(p, full);
      const b = Skia.PathBuilder.Make();
      for (const e of list)
        for (const [x0, y0, x1, y1] of e.boxes)
          b.addRect(Skia.XYWHRect(((x0 - crop.x) / crop.w) * pageW, ((y0 - crop.y) / crop.h) * pageH, ((x1 - x0) / crop.w) * pageW, ((y1 - y0) / crop.h) * pageH));
      out.push({ p, path: b.detach() });
    }
    return out;
  }, [veils, full, pageW, pageH]);
  const lit = [...marks.flatMap((e) => place(e, e.color)), ...chosen.flatMap((e) => place(e, 'rgba(196, 154, 69, 0.3)'))];
  // the mark (Mark here, where the reader will continue): a soft wash of the accent colour behind the marked ayah, one
  // rounded band per line, so it reads as «you are here» without a line, a dot or anything drawn over the words
  const ribbonDraw = useMemo(() => {
    if (!ribbon?.boxes.length) return null;
    const X = (fx: number) => ((fx - shown.x) / shown.w) * pageW;
    const Y = (fy: number) => ((fy - shown.y) / shown.h) * pageH;
    const lines = ribbon.boxes.map(([bx0, by0, bx1, by1], i) => ({ key: i, x: X(bx0) - 3, y: Y(by0) - 1, w: X(bx1) - X(bx0) + 6, h: Y(by1) - Y(by0) + 2 }));
    return { lines };
  }, [ribbon, shown.x, shown.y, shown.w, shown.h, pageW, pageH]);
  const unit = pageW / shown.w / 1000; // the badge's thousandths of the page's width
  const bubble = useMemo(() => ({ body: Skia.Path.MakeFromSVGString(BUBBLE)!, lines: Skia.Path.MakeFromSVGString(BUBBLE_LINES)! }), []);

  // Tasmee's covers of every page given in `veils`, drawn over one of the page pictures
  const covers = (tag: string, role: CoverRole, image: Picture, rect: Place) =>
    coverPaths.map((v) => (
      <Cover key={`${tag}${v.p}`} page={v.p} path={v.path} role={role} at={at} mode={mode} image={image} rect={rect} pageW={pageW} pageH={pageH} paper={paper} />
    ));

  return (
    <GestureDetector gesture={gesture}>
      <View style={{ width, height }}>
        {/* the page's resting place: a hairline and a soft shadow, as on the website (not in full screen) */}
        <View
          style={{
            position: 'absolute',
            left: ox,
            top: oy,
            width: pageW,
            height: pageH,
            backgroundColor: paper,
            ...(!full && {
              borderWidth: 0.5,
              borderColor: c.line,
              shadowColor: '#44372b',
              shadowOpacity: 0.1,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }),
          }}
        />
        <Canvas style={{ position: 'absolute', left: 0, top: 0, width, height }}>
          <Group clip={zoomClip}>
            <Group transform={zoomMove}>
              {/* the page under */}
              <Group clip={whole}>
                <Rect x={0} y={0} width={pageW} height={pageH} color={paper} />
                <SkiaImage image={under} rect={underAt} fit="fill" />
                {covers('u', 'under', under, underAt)}
              </Group>
              <Group clip={uncovered}>
                <Rect x={0} y={0} width={pageW} height={pageH}>
                  <LinearGradient start={foldAt} end={underShadeEnd} colors={['rgba(0,0,0,0.32)', 'rgba(0,0,0,0)']} />
                </Rect>
              </Group>

              {/* the page turning, as much as still lies flat (the chosen ayah lit on it) */}
              <Group clip={flat}>
                <Rect x={0} y={0} width={pageW} height={pageH} color={paper} />
                <SkiaImage image={over} rect={overAt} fit="fill" />
                {covers('o', 'over', over, overAt)}
                <Overlay key={page} mine={page} at={at} mode={mode}>
                  {lit.map((r) => (
                    <Rect key={r.key} x={r.x} y={r.y} width={r.width} height={r.height} color={r.color} />
                  ))}
                  {pins.map((p) => (
                    <Group
                      key={`${p.s}:${p.a}`}
                      opacity={0.75}
                      transform={[
                        { translateX: ((p.x - shown.x) / shown.w) * pageW },
                        { translateY: ((p.y - shown.y) / shown.h) * pageH },
                        { scale: unit },
                      ]}
                    >
                      <Path path={bubble.body} color={p.color} />
                      <Path path={bubble.body} color="#fffaf0" style="stroke" strokeWidth={2.5} strokeJoin="round" />
                      <Path path={bubble.lines} color="#fffaf0" style="stroke" strokeWidth={3} strokeCap="round" />
                    </Group>
                  ))}
                  {ribbonDraw?.lines.map((l) => (
                    <RoundedRect key={l.key} x={l.x} y={l.y} width={l.w} height={l.h} r={Math.min(7, l.h / 2)} color={c.accent} opacity={0.17} />
                  ))}
                </Overlay>
                <Rect x={0} y={0} width={pageW} height={pageH}>
                  <LinearGradient start={foldAt} end={flatShadeEnd} colors={['rgba(0,0,0,0.16)', 'rgba(0,0,0,0)']} />
                </Rect>
              </Group>

              {/* the flap: the back of the page, with its sheen */}
              <Group clip={flap}>
                <Group matrix={backSide}>
                  <Group clip={whole}>
                    <Rect x={0} y={0} width={pageW} height={pageH} color={paper} />
                    <SkiaImage image={over} rect={overAt} fit="fill" />
                    {covers('f', 'over', over, overAt)}
                  </Group>
                </Group>
                <Rect x={-pageW} y={-pageH} width={pageW * 4} height={pageH * 3}>
                  <LinearGradient
                    start={foldAt}
                    end={corner}
                    colors={['rgba(255,255,255,0.78)', 'rgba(242,242,238,0.42)', 'rgba(200,200,196,0.3)', 'rgba(150,150,146,0.24)']}
                    positions={[0, 0.12, 0.5, 1]}
                  />
                </Rect>
              </Group>

              {/* night, the dimmed page: a little dimmer, as on the website */}
              {dimmed && c.nightDim > 0 && <Rect x={0} y={0} width={pageW} height={pageH} color={`rgba(0,0,0,${c.nightDim})`} />}
            </Group>
          </Group>
        </Canvas>
      </View>
    </GestureDetector>
  );
}