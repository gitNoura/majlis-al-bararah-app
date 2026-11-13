// The geometry of the app's Islamic patterns, as SVG path strings (no React in here, so it can be checked on its own).
// Three lattices, all drawn in single fine lines: 'star' (the eight-point star of two squares, points touching),
// 'hex' (the six-point star of two triangles on a honeycomb), 'circles' (overlapping circles, the "flower" lattice);
// plus a rosette (the medallion), a crescent and a pointed cartouche.

export type PatternKind = 'star' | 'hex' | 'circles';

const f = (n: number) => Math.round(n * 100) / 100;

// a regular polygon with `n` corners, circumradius r, the first corner at `rot` degrees (0 = to the right)
function polygon(cx: number, cy: number, r: number, n: number, rot: number) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    d += `${i ? 'L' : 'M'}${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
  }
  return `${d}Z`;
}

// a star with `n` points: 2n corners alternately at r1 (the tips) and r2 (the hollows), the first tip at `rot` degrees
function starPoly(cx: number, cy: number, r1: number, r2: number, n: number, rot: number) {
  let d = '';
  for (let i = 0; i < 2 * n; i++) {
    const a = ((rot + (180 / n) * i) * Math.PI) / 180;
    const r = i % 2 ? r2 : r1;
    d += `${i ? 'L' : 'M'}${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`;
  }
  return `${d}Z`;
}

const circle = (cx: number, cy: number, r: number) => `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;

// the eight-point star: a square and the same square turned a quarter of a right angle
const star8 = (cx: number, cy: number, r: number, turn = 0) => polygon(cx, cy, r, 4, turn) + polygon(cx, cy, r, 4, turn + 45);

// the lattice that fills width × height, with a cell of `s`; the cells start a little outside the frame so the edges are full
export function lattice(kind: PatternKind, width: number, height: number, s: number): string {
  let d = '';
  if (kind === 'star') {
    const r = s / 2; // the points of one star touch the next one's
    const cols = Math.ceil(width / s) + 1;
    const rows = Math.ceil(height / s) + 1;
    for (let j = -1; j < rows; j++) {
      for (let i = -1; i < cols; i++) {
        const cx = i * s + s / 2;
        const cy = j * s + s / 2;
        d += starPoly(cx, cy, r, r * 0.6, 8, 0);
        d += polygon(cx, cy, r * 0.34, 8, 22.5); // a small octagon inside
      }
    }
  } else if (kind === 'hex') {
    const r = s / 2;
    const rowH = s * 0.866;
    const rows = Math.ceil(height / rowH) + 2;
    const cols = Math.ceil(width / s) + 2;
    for (let j = -1; j < rows; j++) {
      for (let i = -1; i < cols; i++) {
        const cx = i * s + (j % 2 ? s / 2 : 0);
        const cy = j * rowH;
        d += starPoly(cx, cy, r, r * 0.56, 6, 0); // the tips point at the six neighbours
        d += polygon(cx, cy, r * 0.3, 6, 0);
      }
    }
  } else {
    const r = s / 2;
    const rowH = r * 0.866;
    const rows = Math.ceil(height / rowH) + 2;
    const cols = Math.ceil(width / r) + 2;
    for (let j = -1; j < rows; j++) {
      for (let i = -1; i < cols; i++) {
        d += circle(i * r + (j % 2 ? r / 2 : 0), j * rowH, r);
      }
    }
  }
  return d;
}

// the medallion: two rings, a sixteen-point star (two eight-point ones turned against each other), a small star in the middle
export function rosette(cx: number, cy: number, r: number) {
  return (
    circle(cx, cy, r) +
    circle(cx, cy, r * 0.93) +
    star8(cx, cy, r * 0.93, 0) +
    star8(cx, cy, r * 0.93, 22.5) +
    circle(cx, cy, r * 0.5) +
    star8(cx, cy, r * 0.36, 22.5)
  );
}

// the sun's rays: short strokes round a disc
export function rays(cx: number, cy: number, r1: number, r2: number, n = 16) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = ((360 / n) * i * Math.PI) / 180;
    d += `M${f(cx + r1 * Math.cos(a))} ${f(cy + r1 * Math.sin(a))}L${f(cx + r2 * Math.cos(a))} ${f(cy + r2 * Math.sin(a))}`;
  }
  return d;
}

// a crescent opening to the right, centred on (cx, cy), r its outer radius
export function crescent(cx: number, cy: number, r: number) {
  const k = 0.78; // how far the inner edge is pushed in
  const x = cx + r * 0.0;
  return `M${f(x + r * 0.35)} ${f(cy - r * 0.94)}A${f(r)} ${f(r)} 0 1 0 ${f(x + r * 0.35)} ${f(cy + r * 0.94)}A${f(r * k)} ${f(r * k)} 0 1 1 ${f(x + r * 0.35)} ${f(cy - r * 0.94)}Z`;
}

// a pointed cartouche (an illuminated heading's long panel with a point at each end) of width w and height h
export function cartouche(cx: number, cy: number, w: number, h: number) {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const t = cy - h / 2;
  const b = cy + h / 2;
  const p = h * 0.8; // how long the points are
  return (
    `M${f(l)} ${f(cy)}C${f(l + p * 0.35)} ${f(cy - h * 0.1)} ${f(l + p * 0.55)} ${f(t)} ${f(l + p)} ${f(t)}` +
    `L${f(r - p)} ${f(t)}C${f(r - p * 0.55)} ${f(t)} ${f(r - p * 0.35)} ${f(cy - h * 0.1)} ${f(r)} ${f(cy)}` +
    `C${f(r - p * 0.35)} ${f(cy + h * 0.1)} ${f(r - p * 0.55)} ${f(b)} ${f(r - p)} ${f(b)}` +
    `L${f(l + p)} ${f(b)}C${f(l + p * 0.55)} ${f(b)} ${f(l + p * 0.35)} ${f(cy + h * 0.1)} ${f(l)} ${f(cy)}Z`
  );
}
