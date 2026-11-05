// The pictures of the morning and evening adhkar cards, painted as the home screen's wird card
// (src/components/HomeScene.tsx): a whole little landscape filling the card.
//   morning - a soft dawn: pale blue high up warming to peach and gold at the horizon, the sun just
//             risen over green hills, a thin cloud, two birds, a mosque on the far ridge
//   evening - the dusk after sunset: deep blue into violet and a rose glow low down, the crescent and
//             a few tiny points of light, the hills dark, the mosque's window lit
// Drawn as shapes (sharp at any size); `mirrored` for the Arabic layout (the sun to the other side).
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';

const W = 200;
const H = 180;
// how much higher the moon and the birds fly on a whole page (`tall`), on its left
const LIFT = 205;

const MORNING = {
  sky: ['#cfe0ea', '#f6dfc4', '#f9caa0'],
  far: '#d9d3bb',
  mosque: '#c7c3a8',
  mid: '#b4c39f',
  near: '#93a986',
  ledge: '#768d6c',
};
const EVENING = {
  sky: ['#26305c', '#4a3f74', '#b8728a'],
  far: '#3a3a62',
  mosque: '#2f3056',
  mid: '#2a2b4d',
  near: '#22223f',
  ledge: '#1b1b33',
};

// the colour of the ground at the very bottom (the nearest hill), to fill under the picture
// «Morning and evening» in one picture: the dawn, and beyond a slanting line the dusk
export function MorningEvening({ width, height, mirrored }: { width: number; height: number; mirrored?: boolean }) {
  return (
    <View style={{ width, height }}>
      <AdhkarScene width={width} height={height} mirrored={mirrored} />
      <View style={{ position: 'absolute', left: 0, top: 0 }}>
        <AdhkarScene evening slashed width={width} height={height} mirrored={mirrored} />
      </View>
    </View>
  );
}

export const sceneGround = (evening?: boolean) => (evening ? EVENING : MORNING).near;

// `tall`: for a whole page (a phone held upright) - the same landscape at the bottom under a sky twice as high
// `sky`: another sky by day (a category's colour); `plain`: no sun, moon, cloud or birds (a drawing
// takes their place: src/components/PaintedScene.tsx)
export function AdhkarScene({
  evening,
  width,
  height,
  mirrored,
  tall,
  sky,
  plain,
  slashed,
}: {
  evening?: boolean;
  width: number;
  height: number;
  mirrored?: boolean;
  tall?: boolean;
  sky?: string[];
  plain?: boolean;
  // only the part beyond a slanting line (the evening half of «morning and evening»)
  slashed?: boolean;
}) {
  const k = evening ? EVENING : sky ? { ...MORNING, sky } : MORNING;
  // (each sky its own gradients' names, as many pictures can be on one screen)
  const id = `${evening ? 'pm' : 'am'}${sky ? sky[0].slice(1) : ''}`;
  // on a whole page the moon and the birds fly on the left of the sky (the picture turned round in
  // Arabic: they are drawn on its right then)
  const toLeft = mirrored ? 0 : -124;
  return (
    <Svg width={width} height={height} viewBox={tall ? `0 ${-H} ${W} ${2 * H}` : `0 0 ${W} ${H}`} preserveAspectRatio={tall ? 'xMidYMax slice' : 'xMidYMid slice'} style={mirrored ? { transform: [{ scaleX: -1 }] } : undefined}>
      <Defs>
        <ClipPath id={`as-cut-${id}`}>
          <Polygon points="118,-400 400,-400 400,400 82,400" />
        </ClipPath>
        <LinearGradient id={`as-sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={k.sky[0]} />
          <Stop offset="0.55" stopColor={k.sky[1]} />
          <Stop offset="1" stopColor={k.sky[2]} />
        </LinearGradient>
        <RadialGradient id={`as-glow-${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={evening ? '#f4e3b8' : '#ffd79a'} stopOpacity={evening ? 0.28 : 0.7} />
          <Stop offset="1" stopColor={evening ? '#f4e3b8' : '#ffd79a'} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`as-sun-${id}`} cx="45%" cy="40%" r="60%">
          <Stop offset="0" stopColor="#ffd27f" />
          <Stop offset="1" stopColor="#f5a54f" />
        </RadialGradient>
        <LinearGradient id={`as-mist-${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0} />
          <Stop offset="0.5" stopColor="#ffffff" stopOpacity={evening ? 0.05 : 0.35} />
          <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <G clipPath={slashed ? `url(#as-cut-${id})` : undefined}>

      <Rect y={tall ? -H : 0} width={W} height={tall ? 2 * H : H} fill={`url(#as-sky-${id})`} />

      {plain ? null : evening ? (
        // (on a whole page, high up in the sky above the cards)
        <G transform={tall ? `translate(${toLeft} ${-LIFT})` : undefined}>
          {/* the crescent, its soft light, a few tiny points of light */}
          <Circle cx={164} cy={78} r={26} fill={`url(#as-glow-${id})`} />
          <Path d="M168 64a14 14 0 1 0 5 25a11 11 0 1 1-5-25z" fill="#f6e7c1" />
          {[
            [128, 80, 1.1],
            [140, 64, 0.8],
            [114, 96, 0.9],
            [190, 56, 0.9],
            [188, 100, 0.8],
            [100, 78, 0.7],
          ].map(([x, y, r], i) => (
            <Circle key={i} cx={x} cy={y} r={r} fill="#fff6dc" opacity={0.85} />
          ))}
        </G>
      ) : (
        <>
          {/* the sun just risen, a thin cloud, two birds */}
          <Circle cx={150} cy={104} r={42} fill={`url(#as-glow-${id})`} />
          <Circle cx={150} cy={104} r={19} fill={`url(#as-sun-${id})`} />
          <Path d="M118 84q6-6 13-2q5-5 11-1q7 1 7 5H114q0-2 4-2z" fill="#ffffff" opacity={0.7} />
          <Path
            d="M166 70q2.6-2.6 5.2 0q2.6-2.6 5.2 0M178 62q2.2-2.2 4.4 0q2.2-2.2 4.4 0"
            stroke="#9b8569"
            strokeWidth={1}
            fill="none"
            strokeLinecap="round"
            transform={tall ? `translate(${toLeft - 8} ${-LIFT})` : undefined}
          />
        </>
      )}

      {/* the far ridge, the mosque on it */}
      <Path d="M0 116L24 104L48 110L74 96L100 106L128 90L152 104L178 94L200 102V180H0Z" fill={k.far} />
      <G fill={k.mosque} transform="translate(-6 -2)">
        <Path d="M40 104q9-13 18 0z" />
        <Rect x={38.5} y={103} width={21} height={7} />
        <Rect x={62} y={92} width={2.6} height={18} />
        <Path d="M61.7 92l1.6-4.5 1.6 4.5z" />
        <Rect x={33} y={96} width={2.2} height={14} />
        <Path d="M32.6 96l1.5-3.8 1.5 3.8z" />
      </G>
      {evening && <Rect x={47} y={104} width={3} height={4} rx={1.5} fill="#f3d77e" opacity={0.95} />}

      {/* the hills, the mist between them */}
      <Path d="M0 134C24 124 48 130 72 122C96 114 120 128 144 118C168 110 186 118 200 114V180H0Z" fill={k.mid} />
      <Rect y={112} width={W} height={40} fill={`url(#as-mist-${id})`} />
      <Path d="M0 152C30 142 60 148 90 143C120 138 150 147 180 141C190 139 196 140 200 139V180H0Z" fill={k.near} />
      <Path d="M108 180C122 166 148 161 172 163C186 164 194 168 200 170V180Z" fill={k.ledge} />
      </G>
    </Svg>
  );
}
