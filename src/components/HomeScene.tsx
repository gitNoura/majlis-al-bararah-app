// The picture of the home screen's wird card: a calm evening over green hills, a mosque on the far
// ridge under the sun. By day a warm sky and a setting sun, birds; at night the dark sky and the
// mosque's window lit (the card's lantern hangs in the sun's place: src/app/index.tsx). Drawn as lines (sharp at any size), filling its card.
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

const W = 360;
const H = 250;

const DAY = {
  sky: ['#f4d6b8', '#f3e6d2', '#e8ebdb'],
  far: '#d6d5c2',
  mosque: '#c2c7b0',
  mid: '#b5c1a1',
  near: '#93a688',
  ledge: '#6f8466',
};
const NIGHT = {
  sky: ['#13211d', '#1d2e28', '#283830'],
  far: '#2b3b34',
  mosque: '#34463d',
  mid: '#25352e',
  near: '#1e2b26',
  ledge: '#17221e',
};

export function HomeScene({ night, width, height }: { night: boolean; width: number; height: number }) {
  const k = night ? NIGHT : DAY;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={k.sky[0]} />
          <Stop offset="0.55" stopColor={k.sky[1]} />
          <Stop offset="1" stopColor={k.sky[2]} />
        </LinearGradient>
        <RadialGradient id="hs-glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={night ? '#f3e2b0' : '#f7c48f'} stopOpacity={night ? 0.22 : 0.55} />
          <Stop offset="1" stopColor={night ? '#f3e2b0' : '#f7c48f'} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="hs-sun" cx="45%" cy="40%" r="60%">
          <Stop offset="0" stopColor="#f6b46f" />
          <Stop offset="1" stopColor="#ee9a52" />
        </RadialGradient>
        <LinearGradient id="hs-mist" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0} />
          <Stop offset="0.5" stopColor="#ffffff" stopOpacity={night ? 0.05 : 0.32} />
          <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* the sky */}
      <Rect width={W} height={H} fill="url(#hs-sky)" />

      {/* the sun going down, its birds (at night the card's lantern hangs in its place: the night look can
          be chosen by day too, so no moon or stars) */}
      {!night && (
        <>
          <Circle cx={286} cy={66} r={50} fill="url(#hs-glow)" />
          <Circle cx={286} cy={66} r={25} fill="url(#hs-sun)" />
          <Path d="M318 30q3.5-3.5 7 0q3.5-3.5 7 0M302 20q3-3 6 0q3-3 6 0" stroke="#a88b6c" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        </>
      )}

      {/* the far ridge, and the mosque on it under the sun (away from the card's words) */}
      <Path d="M0 152L38 130L76 141L118 116L160 133L204 100L246 126L290 106L330 128L360 118V250H0Z" fill={k.far} />
      <G fill={k.mosque} transform="translate(170 0)">
        <Path d="M126 124q13-19 26 0z" />
        <Rect x={124} y={123} width={30} height={9} />
        <Rect x={157} y={106} width={3.4} height={26} />
        <Path d="M156.6 106l2.1-6 2.1 6z" />
        <Rect x={117} y={112} width={3} height={20} />
        <Path d="M116.4 112l2.1-5 2.1 5z" />
      </G>
      {night && <Rect x={307} y={125} width={4} height={5} rx={2} fill="#f3d77e" opacity={0.9} />}

      {/* the hills, the mist between them */}
      <Path d="M0 180C40 162 80 172 120 160C160 148 200 168 240 154C280 142 320 158 360 148V250H0Z" fill={k.mid} />
      <Rect y={150} width={W} height={56} fill="url(#hs-mist)" />
      <Path d="M0 206C50 191 100 201 150 193C200 185 250 199 300 189C330 183 350 187 360 185V250H0Z" fill={k.near} />
      <Path d="M196 250C218 229 258 222 298 224C330 226 350 232 360 236V250Z" fill={k.ledge} />

    </Svg>
  );
}
