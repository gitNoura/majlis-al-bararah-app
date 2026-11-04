// The tree in the corner, by day where the lantern hangs at night (the website's src/core/branch.js; its
// drawing as it is, coloured here, and moved by src/components/Tree.tsx). On the website:: an olive on the Ahadith
// screen, an orange tree on the Quran page, a vine on the Qibla, a pomegranate on the Calendar
// (data-kind). The top of a tree seen from below: a limb
// comes in from the side, low in the corner, and rises up and in, tapering; twigs reach up off it (one
// along the edge, one between, one spreading out and up, one to the top, and a twiglet off the
// spreading one), with leaves in pairs and a cluster at each tip, and the fruit hanging - olives in
// small clusters, green and ripe (some olive leaves turned to show their silver underside); or
// oranges, and orange blossom at the tips; or pomegranates, crowned, with red flowers and the young
// leaves copper; or a vine: broad five-lobed leaves one by one along the
// wood, a curling tendril at each tip, and bunches of grapes. The limb sways from its foot and each
// twig from where it grows, each on its own rhythm, as in a breeze; touched, they swing one after the
// other, the leaves shiver, and a leaf (or a blossom) comes off and drifts down the screen, a new one
// growing back in its place. The look: components/branch.css.
// The breeze moves the whole tree as one picture (the phone's graphics do it, nothing is drawn again);
// leaf by leaf, every frame, it slowed the pages under it to a third on phones. Only a touch moves the
// twigs and the leaves, for a moment.

// The limb: a curve (start, two pulls, end) and its width at the foot and at the tip.
const LIMB = { curve: [[-12, 116], [18, 96], [44, 56], [92, 10]], width: [7, 1.4], nodes: [0.42, 0.62], fruit: [[0.58, 2]] };
// The twigs: where each grows off the limb (or off another twig, «on»), its curve from there (two
// pulls and the end, relative), its widths, where its leaves pair up, and its fruit (where, how many).
const TWIGS = [
  { at: 0.3, curve: [[-2, -20], [-6, -44], [-4, -70]], width: [3.2, 0.8], nodes: [0.35, 0.6, 0.82], fruit: [] },
  { at: 0.5, curve: [[-6, -14], [-4, -30], [4, -44]], width: [2.4, 0.7], nodes: [0.45, 0.75], fruit: [] },
  { at: 0.7, curve: [[14, -2], [30, -2], [46, -12]], width: [2.4, 0.7], nodes: [0.35, 0.65, 0.85], fruit: [[0.7, 3]] },
  { at: 0.85, curve: [[-4, -10], [-6, -20], [-4, -30]], width: [1.8, 0.6], nodes: [0.55], fruit: [] },
  { on: 2, at: 0.5, curve: [[2, -8], [6, -14], [10, -20]], width: [1.3, 0.5], nodes: [0.6], fruit: [] },
];
// What each tree has: its leaves' half width and length, how many of the fruit hang together at most,
// whether it is in blossom, and whether it is a vine (lobed leaves one by one, tendrils, bunches).
const KINDS = {
  olive: { w: 4.8, size: 1, cluster: 3, blossom: false },
  orange: { w: 7.4, size: 0.92, cluster: 2, blossom: true },
  grape: { size: 1.3, cluster: 1, blossom: false, vine: true },
  pomegranate: { w: 3.8, size: 0.95, cluster: 2, blossom: true },
};
let kind = 'olive'; // the tree being drawn
let K = KINDS.olive;

const point = ([a, b, c, d], t) => {
  const u = 1 - t;
  const x = u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0];
  const y = u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1];
  const dx = 3 * u * u * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t * t * (d[0] - c[0]);
  const dy = 3 * u * u * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t * t * (d[1] - c[1]);
  return { x, y, deg: (Math.atan2(dy, dx) * 180) / Math.PI };
};
// a little of each leaf's own (its length, its green), the same every time
const rnd = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const f1 = (n) => n.toFixed(1);
const leafPath = (l, w) => `M0 0Q${f1(l / 2)} -${w} ${f1(l)} 0Q${f1(l / 2)} ${w} 0 0Z`;
// A vine leaf, along x from the stalk's notch to its tip (0 to l), as wide as long: five pointed
// lobes - two at its base, two at its sides, one at its end - each side drawn as [control, point]
// pairs from the notch to the tip, the other side the same turned over.
const VINE = [[0.02, 0.1], [0.04, 0.3], [0.2, 0.4], [0.36, 0.3], [0.46, 0.5], [0.62, 0.46], [0.66, 0.3], [0.62, 0.18], [0.86, 0.2], [1, 0]];
function vinePath(l) {
  const s = (x, y) => `${f1(x * l)} ${f1(y * l * 0.9)}`;
  let d = `M${s(0.14, 0)}`;
  for (let k = 0; k < VINE.length; k += 2) d += `Q${s(...VINE[k])} ${s(...VINE[k + 1])}`;
  const back = [[0.14, 0], ...VINE.filter((_, k) => k % 2).slice(0, -1)].reverse(); // the points, tip to notch
  for (let k = VINE.length - 2, j = 0; k >= 0; k -= 2, j++) d += `Q${s(VINE[k][0], -VINE[k][1])} ${s(back[j][0], -back[j][1])}`;
  return `${d}Z`;
}
// its ribs: from the notch to the tip of each lobe
const vineRibs = (l) =>
  [[0.95, 0], [0.58, 0.42], [0.58, -0.42], [0.1, 0.26], [0.1, -0.26]].map(([x, y]) => `M${f1(0.14 * l)} 0L${f1(x * l)} ${f1(y * l * 0.9)}`).join('');
// a leaf's outline and its ribs, whatever the tree
const leafShape = (k, l) =>
  KINDS[k].vine ? { body: vinePath(l), rib: vineRibs(l) } : { body: leafPath(l, KINDS[k].w), rib: `M1.5 0H${f1(l - 2.5)}` };
const petals = (r) =>
  [0, 1, 2, 3, 4].map((k) => `<ellipse cx="0" cy="${f1(-r * 0.6)}" rx="${f1(r * 0.42)}" ry="${f1(r * 0.62)}" transform="rotate(${k * 72})"/>`).join('');

// Wood: the curve as a band narrowing from w0 to w1.
function wood(curve, [w0, w1]) {
  const left = [];
  const right = [];
  for (let k = 0; k <= 24; k++) {
    const t = k / 24;
    const p = point(curve, t);
    const r = ((p.deg + 90) * Math.PI) / 180;
    const w = (w0 + (w1 - w0) * t) / 2;
    left.push(`${f1(p.x + Math.cos(r) * w)} ${f1(p.y + Math.sin(r) * w)}`);
    right.push(`${f1(p.x - Math.cos(r) * w)} ${f1(p.y - Math.sin(r) * w)}`);
  }
  return `<path class="branch-wood" d="M${left.join('L')}L${right.reverse().join('L')}Z"/>`;
}

let n = 0;

// A leaf where it grows, turned off the stem and drooping a little; greens a and b, and c: the olive's
// silver underside, the orange's (or the vine's) young leaf.
function leaf(x, y, deg, l) {
  const i = n++;
  const droop = (((90 - deg + 540) % 360) - 180) * 0.2;
  const len = l * K.size * (0.85 + 0.3 * rnd(i));
  const green = i % 4 === 2 ? 'c' : rnd(i + 50) < 0.55 ? 'a' : 'b';
  const { body, rib } = leafShape(kind, len);
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${(deg + droop).toFixed(0)})">
    <g class="leaf" data-l="${f1(len)}" data-g="${green}">
      <g class="leaf-shiver"><path class="leaf-${green}" d="${body}"/><path class="leaf-rib" d="${rib}"/></g>
    </g>
  </g>`;
}

// a vine's tendril: a thin shoot curling at its end
function tendril(x, y, deg) {
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${deg.toFixed(0)})"><path class="tendril" d="M0 0C5 -1 9 -4 9 -8C9 -11 5 -12 4 -9C3.4 -7 5.5 -6 6.4 -7.6"/></g>`;
}

// an orange blossom: five white petals, a golden heart
function blossom(x, y, r) {
  const i = n++;
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${Math.round(rnd(i) * 72)})">
    <g class="leaf blossom" data-l="${f1(r)}" data-g="blossom">
      <g class="leaf-shiver"><g class="blossom-petals">${petals(r)}</g><circle class="blossom-heart" r="${f1(r * 0.28)}"/></g>
    </g>
  </g>`;
}

// leaves in pairs at the nodes, a cluster of three at the tip (and blossom by it, on a tree in flower);
// on a vine, one leaf at each node, on one side then the other, one at the tip and a tendril
function leaves(curve, nodes, size) {
  let out = '';
  if (K.vine) {
    nodes.forEach((t, k) => {
      const p = point(curve, t);
      out += leaf(p.x, p.y, p.deg + (k % 2 ? 58 : -58), size * (1 - 0.2 * t));
    });
    const tip = point(curve, 1);
    return out + tendril(tip.x, tip.y, tip.deg + 30) + leaf(tip.x, tip.y, tip.deg - 20, size * 0.7);
  }
  for (const t of nodes) {
    const p = point(curve, t);
    const l = size * (1 - 0.25 * t);
    out += leaf(p.x, p.y, p.deg + 48, l) + leaf(p.x, p.y, p.deg - 48, l);
  }
  const tip = point(curve, 1);
  out += leaf(tip.x, tip.y, tip.deg - 26, size * 0.72) + leaf(tip.x, tip.y, tip.deg + 26, size * 0.72) + leaf(tip.x, tip.y, tip.deg, size * 0.82);
  if (K.blossom) {
    const p = point(curve, 0.88);
    const r = ((p.deg + 90) * Math.PI) / 180;
    out += blossom(p.x + Math.cos(r) * 7, p.y + Math.sin(r) * 7, 4.6) + blossom(p.x - Math.cos(r) * 6, p.y - Math.sin(r) * 6, 4);
  }
  return out;
}

// a bunch of grapes under (x, y): rows of grapes, wide at the top, narrowing to one
function bunch(x, y) {
  let out = `<path class="branch-stalk" d="M${f1(x)} ${f1(y)}L${f1(x + 1)} ${f1(y + 6)}"/>`;
  [4, 3, 3, 2, 1].forEach((count, row) => {
    for (let k = 0; k < count; k++) {
      const cx = x + 1 + (k - (count - 1) / 2) * 4.4 + (row % 2 ? 0.6 : 0);
      const cy = y + 8 + row * 3.8;
      out += `<circle class="grape${rnd(n + row * 5 + k) < 0.4 ? ' b' : ''}" cx="${f1(cx)}" cy="${f1(cy)}" r="2.5"/>
        <circle class="fruit-shine" cx="${f1(cx - 0.8)}" cy="${f1(cy - 0.9)}" r="0.7"/>`;
    }
  });
  return out;
}

// the fruit hanging on short stalks, a few together: olives green and ripe, or oranges; on a vine,
// a bunch of grapes
function fruit(curve, list) {
  let out = '';
  for (const [t, many] of list) {
    const count = Math.min(many, K.cluster);
    const p = point(curve, t);
    for (let k = 0; k < count; k++) {
      if (K.vine) {
        out += bunch(p.x, p.y);
      } else if (kind === 'pomegranate') {
        // red and round, its little crown at the bottom
        const x = p.x + (k - (count - 1) / 2) * 14;
        const y = p.y + 11 + (k % 2) * 3;
        out += `<path class="branch-stalk" d="M${f1(p.x)} ${f1(p.y)}L${f1(x)} ${f1(y - 6)}"/>
          <circle class="pomegranate" cx="${f1(x)}" cy="${f1(y)}" r="6.4"/>
          <path class="pomegranate-crown" d="M${f1(x - 2.4)} ${f1(y + 5.4)}L${f1(x - 2)} ${f1(y + 8.2)}L${f1(x - 1)} ${f1(y + 6.6)}L${f1(x)} ${f1(y + 8.4)}L${f1(x + 1)} ${f1(y + 6.6)}L${f1(x + 2)} ${f1(y + 8.2)}L${f1(x + 2.4)} ${f1(y + 5.4)}Z"/>
          <circle class="fruit-shine" cx="${f1(x - 2.2)}" cy="${f1(y - 2.4)}" r="1.7"/>`;
      } else if (K === KINDS.orange) {
        const x = p.x + (k - (count - 1) / 2) * 13;
        const y = p.y + 11 + (k % 2) * 4;
        out += `<path class="branch-stalk" d="M${f1(p.x)} ${f1(p.y)}L${f1(x)} ${f1(y - 6)}"/>
          <circle class="orange" cx="${f1(x)}" cy="${f1(y)}" r="6.2"/>
          <path class="orange-calyx" d="M${f1(x - 2)} ${f1(y - 6)}l2 1.4 2-1.4"/>
          <circle class="fruit-shine" cx="${f1(x - 2)}" cy="${f1(y - 2.2)}" r="1.6"/>`;
      } else {
        const x = p.x + (k - (count - 1) / 2) * 6;
        const y = p.y + 9 + (k % 2) * 3;
        const ripe = rnd(n + k * 7) < 0.4;
        out += `<path class="branch-stalk" d="M${f1(p.x)} ${f1(p.y)}L${f1(x)} ${f1(y - 4)}"/>
          <ellipse class="olive${ripe ? ' ripe' : ''}" cx="${f1(x)}" cy="${f1(y)}" rx="3" ry="4" transform="rotate(${(k - 1) * 12} ${f1(x)} ${f1(y)})"/>
          <circle class="fruit-shine" cx="${f1(x - 1)}" cy="${f1(y - 1.5)}" r="0.9"/>`;
      }
    }
  }
  return out;
}

// a twig, turning about where it grows when the tree is touched, with its own twiglets inside it
function twig(i, base, parts) {
  const { curve, width, nodes } = TWIGS[i];
  const abs = [[base.x, base.y], ...curve.map(([x, y]) => [base.x + x, base.y + y])];
  const children = TWIGS.map((tw, j) => (tw.on === i ? twig(j, point(abs, tw.at), parts) : '')).join('');
  parts.push(abs);
  return `<g class="twig" style="transform-origin: ${f1(base.x)}px ${f1(base.y)}px">
    ${wood(abs, width)}
    ${children}
    ${fruit(abs, TWIGS[i].fruit)}
    ${leaves(abs, nodes, 19 - i)}
  </g>`;
}

function draw(name) {
  kind = name in KINDS ? name : 'olive';
  K = KINDS[kind];
  const hits = [LIMB.curve];
  const twigs = TWIGS.map((tw, i) => (tw.on === undefined ? twig(i, point(LIMB.curve, tw.at), hits) : '')).join('');
  const line = ([a, b, c, d]) => `M${a}C${b} ${c} ${d}`;
  return `<svg viewBox="0 0 170 120"><g class="bough" style="transform-origin: 0px 116px">
    ${wood(LIMB.curve, LIMB.width)}
    ${twigs}
    ${fruit(LIMB.curve, LIMB.fruit)}
    ${leaves(LIMB.curve, LIMB.nodes, 21)}
    ${hits.map((c) => `<path class="branch-hit" d="${line(c)}"/>`).join('')}
  </g></svg>`;
}

// ---------- for the app: the drawing as one SVG text, coloured (the website's components/branch.css) ----------

// each kind's three greens (a, b, and c: the olive's silver underside, the orange's or the vine's young
// leaf, the pomegranate's copper one)
const GREENS = {
  olive: ['#4b7041', '#6c9256', '#a8bc98'],
  orange: ['#2f5d34', '#457a3c', '#79a65a'],
  grape: ['#4f7a37', '#6a9443', '#93b55a'],
  pomegranate: ['#3f6b35', '#5a8a3e', '#b0683f'],
};

function paint(xml, name) {
  const [a, b, c] = GREENS[name] ?? GREENS.olive;
  const petals = name === 'pomegranate' ? 'fill="#e0532f" stroke="rgba(150,40,20,0.35)"' : 'fill="#fffdf6" stroke="rgba(180,160,120,0.45)"';
  const COLOURS = {
    'branch-wood': 'fill="#6b5536"',
    'branch-stalk': 'fill="none" stroke="#6b5536" stroke-width="0.8"',
    'branch-hit': 'fill="none" stroke="none"',
    'leaf-a': `fill="${a}"`,
    'leaf-b': `fill="${b}"`,
    'leaf-c': `fill="${c}"`,
    'leaf-rib': 'fill="none" stroke="rgba(255,255,255,0.32)" stroke-width="0.6"',
    olive: 'fill="#5d7a34"',
    'olive ripe': 'fill="#3d3043"',
    orange: 'fill="#f0962c"',
    'orange-calyx': 'fill="none" stroke="#3f6a33" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"',
    'fruit-shine': 'fill="rgba(255,255,255,0.45)"',
    'blossom-petals': `${petals} stroke-width="0.4"`,
    'blossom-heart': 'fill="#f2c14e"',
    pomegranate: 'fill="#b8312f"',
    'pomegranate-crown': 'fill="#8f2425"',
    grape: 'fill="#5a2f57"',
    'grape b': 'fill="#74406a"',
    tendril: 'fill="none" stroke="#7d8a46" stroke-width="0.8" stroke-linecap="round"',
  };
  return xml
    .replace(/ style="[^"]*"/g, '')
    .replace(/ data-[a-z]+="[^"]*"/g, '')
    .replace(/ class="([^"]*)"/g, (_, cls) => (COLOURS[cls] ? ` ${COLOURS[cls]}` : ''));
}

// The tree in the corner, drawn for the left corner (170 × 120), as an SVG text
export const treeXml = (name) => paint(draw(name), name);

// A leaf of the tree (or a blossom), to drop when it is touched: an SVG text and its size
export function leafXml(name) {
  kind = name in KINDS ? name : 'olive';
  const l = 14;
  const blossom = KINDS[kind].blossom && Math.random() < 0.4;
  const green = ['a', 'b', 'c'][Math.floor(Math.random() * 3)];
  const shape = leafShape(kind, l);
  const xml = blossom
    ? `<svg viewBox="${-l * 1.3} ${-l * 1.3} ${l * 2.6} ${l * 2.6}"><g class="blossom-petals">${petals(l * 0.45)}</g><circle class="blossom-heart" r="${l * 0.13}"/></svg>`
    : `<svg viewBox="-1 ${-l / 2} ${l + 2} ${l}"><path class="leaf-${green}" d="${shape.body}"/><path class="leaf-rib" d="${shape.rib}"/></svg>`;
  return { xml: paint(xml, kind), size: l * 1.2 };
}
