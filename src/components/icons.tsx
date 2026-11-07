// Small line icons (the website's, drawn here with react-native-svg so they take any colour).
import Svg, { Circle, Path } from 'react-native-svg';

type IconProps = { size?: number; color: string; strokeWidth?: number };

export function ClockIcon({ size = 22, color, strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7v5l3 2" />
    </Svg>
  );
}

export function BookIcon({ size = 18, color, strokeWidth = 1.6 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round">
      <Path d="M12 6C10 4.5 7 4.3 4 5v13c3-.7 6-.5 8 1 2-1.5 5-1.7 8-1V5c-3-.7-6-.5-8 1ZM12 6v13" />
    </Svg>
  );
}

export function FlameIcon({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.3 1.3 1 2 2 2.2C10.5 8 11 5.5 12 3Z" fill={color} />
    </Svg>
  );
}

export function SettingsIcon({ size = 22, color, strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={3} />
      <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </Svg>
  );
}

// A line icon from the website's icons.svg: its paths (and circles) in a 24 × 24 box
function Line({ size = 22, color, strokeWidth = 1.7, children }: IconProps & { children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
}

export const MenuIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M4 7h16M4 12h16M4 17h16" />
  </Line>
);
export const SearchIcon = (p: IconProps) => (
  <Line {...p}>
    <Circle cx={11} cy={11} r={6.5} />
    <Path d="M20 20l-4.2-4.2" />
  </Line>
);
// the home screen: its tab (filled when it is the one open), the member's round, and the five prayers
export function HomeIcon({ size = 22, color, filled }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M4 10.5L12 4l8 6.5V19.5a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />
    </Svg>
  );
}
export const PersonIcon = (p: IconProps) => (
  <Line {...p}>
    <Circle cx={12} cy={8.5} r={3.8} />
    <Path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" />
  </Line>
);
export const PlusIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M12 5v14M5 12h14" />
  </Line>
);
// the five prayers, each its time of day: al-Fajr the first light over the horizon under the last star,
// al-Dhuhr the sun high, al-Asr the sun lower over the ground, al-Maghrib the sun going down into the
// horizon, al-Isha the crescent among the stars
export const FajrIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M3 19h18M7 19a5 5 0 0 1 10 0M12 11v1.6M7.4 13.2l1.1 1.1M16.6 13.2l-1.1 1.1" />
    <Path d="M6 3.5v3M4.5 5h3" />
  </Line>
);
export const DhuhrIcon = (p: IconProps) => (
  <Line {...p}>
    <Circle cx={12} cy={12} r={4} />
    <Path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
  </Line>
);
export const AsrIcon = (p: IconProps) => (
  <Line {...p}>
    <Circle cx={14} cy={10} r={3.5} />
    <Path d="M14 3.6v1.4M19.4 5.3l-1 1M20.6 10h-1.4M8.6 5.3l1 1M3 19.5h18M5 16.5h6" />
  </Line>
);
export const MaghribIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M3 15.5h18M7 15.5a5 5 0 0 1 10 0M6 18.5h12M9 21h6M12 4v4.5M9.8 6.6L12 8.8l2.2-2.2" />
  </Line>
);
export const IshaIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M18 15.5A7.5 7.5 0 0 1 8.5 6a7.5 7.5 0 1 0 9.5 9.5z" />
    <Path d="M17 3.5v3M15.5 5h3M20.5 8.5v2M19.5 9.5h2" />
  </Line>
);
// the ayah's options (the website's book-columns, comment, pen, trash)
export const TafsirIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
  </Line>
);
export const CommentIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M5 4.5h14A1.5 1.5 0 0 1 20.5 6v9a1.5 1.5 0 0 1-1.5 1.5h-8L6.5 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V6A1.5 1.5 0 0 1 5 4.5z" />
    <Path d="M7.5 9h9M7.5 12.5h6" />
  </Line>
);
export const PenIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M4 20h7" />
    <Path d="M14.5 4.5l5 5L11 18H6v-5z" />
  </Line>
);
export const TrashIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M4 7h16M10 7V4.5h4V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6" />
  </Line>
);
export const CheckIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M5 12.5l4.5 4.5L19 7.5" />
  </Line>
);
export const DownloadIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14" />
  </Line>
);
export const RiwayaIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M12 6C10 4.5 7 4.3 4 5v13c3-.7 6-.5 8 1 2-1.5 5-1.7 8-1V5c-3-.7-6-.5-8 1ZM12 6v13" />
  </Line>
);
// «the whole page» while zoomed in (the website's #pinch-out): a magnifier with a minus
export const ZoomInIcon = (p: IconProps) => (
  <Line {...p}>
    <Circle cx={11} cy={11} r={7} />
    <Path d="M16.5 16.5L21 21M8 11h6M11 8v6" />
  </Line>
);
export const ZoomOutIcon = (p: IconProps) => (
  <Line {...p}>
    <Circle cx={11} cy={11} r={7} />
    <Path d="M16.5 16.5L21 21M8 11h6" />
  </Line>
);
export const NotebookIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M6.5 3.5h11A1.5 1.5 0 0 1 19 5v14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5z" />
    <Path d="M8.5 3.5v17" />
    <Path d="M13 3.5v6l1.75-1.4 1.75 1.4v-6" />
    <Path d="M11 13h5M11 16h4" />
  </Line>
);
export const ExpandIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </Line>
);
export const CloseIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M6 6l12 12M18 6L6 18" />
  </Line>
);
// a place: the map pin
export const PinIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11z" />
    <Circle cx={12} cy={10} r={2.3} />
  </Line>
);
export const BookOpenIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5M12 6.5C14 5 17 4.5 20 5v13c-3-.5-6 0-8 1.5M12 6.5v13" />
    <Path d="M15.5 5.3v5.2l1.5-1.2 1.5 1.2V5.1" />
  </Line>
);
export const MoonIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </Line>
);
export const SunIcon = (p: IconProps) => (
  <Line {...p}>
    <Circle cx={12} cy={12} r={4} />
    <Path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
  </Line>
);
// the page's light at night (dark screen / dimmed page): a round half filled
export const ContrastIcon = (p: IconProps) => (
  <Line {...p}>
    <Circle cx={12} cy={12} r={8.5} />
    <Path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill={p.color} />
  </Line>
);
export const CopyIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M8 8h11v12H8z" />
    <Path d="M5 15V6a2 2 0 0 1 2-2h8" />
  </Line>
);

// share: three joined dots
export const ShareIcon = (p: IconProps) => (
  <Line {...p}>
    <Circle cx={18} cy={5.5} r={2.6} />
    <Circle cx={6} cy={12} r={2.6} />
    <Circle cx={18} cy={18.5} r={2.6} />
    <Path d="M8.3 10.8l7.4-4M8.3 13.2l7.4 4" />
  </Line>
);
// save: a bookmark, filled once saved (`on`)
export function BookmarkIcon({ size = 22, color, strokeWidth = 1.7, on }: IconProps & { on?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={on ? color : 'none'} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6.5 3.5h11v17l-5.5-4-5.5 4z" />
    </Svg>
  );
}

// like: a heart, filled once liked (`on`)
export function HeartIcon({ size = 22, color, strokeWidth = 1.7, on }: IconProps & { on?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={on ? color : 'none'} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </Svg>
  );
}

// language: a globe
export const LanguageIcon = (p: IconProps) => (
  <Line {...p}>
    <Circle cx={12} cy={12} r={8.5} />
    <Path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5s1.2-6.1 3.6-8.5z" />
  </Line>
);

// the adhkar's listen button: a play triangle; stop: two bars (filled)
export const ListenPlayIcon = (p: IconProps) => (
  <Svg width={p.size ?? 22} height={p.size ?? 22} viewBox="0 0 24 24">
    <Path d="M8 5.5v13l11-6.5z" fill={p.color} />
  </Svg>
);
export const ListenPauseIcon = (p: IconProps) => (
  <Svg width={p.size ?? 22} height={p.size ?? 22} viewBox="0 0 24 24">
    <Path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" fill={p.color} />
  </Svg>
);

// back to the top: a line along the top and a chevron pointing up to it
export const ToTopIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M5 5h14M6.5 17.5L12 12l5.5 5.5" />
  </Line>
);

// The index's number badge: an eight-pointed star outlined in gold, filled forest green when chosen
export function StarBadge({ size = 38, fill, stroke }: { size?: number; fill: string; stroke: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" style={{ position: 'absolute' }}>
      <Path
        d="M20 1.4L25.45 6.85H33.15V14.55L38.6 20L33.15 25.45V33.15H25.45L20 38.6L14.55 33.15H6.85V25.45L1.4 20L6.85 14.55V6.85H14.55Z"
        fill={fill}
        stroke={stroke}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// «back»: a chevron pointing to where the reader came from (right in Arabic, left in English/French)
export function BackIcon({ size = 24, color, rtl }: IconProps & { rtl: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={rtl ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
    </Svg>
  );
}

// The Hifdh tabs: «Listen» (a play triangle) and «Recite» (a microphone)
export const PlayIcon = (p: IconProps) => (
  <Line {...p}>
    <Path fill={p.color} d="M8.5 5.8v12.4a.9.9 0 0 0 1.37.77l9.9-6.2a.9.9 0 0 0 0-1.54l-9.9-6.2A.9.9 0 0 0 8.5 5.8z" />
  </Line>
);
export const MicIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M12 3.5a3 3 0 0 0-3 3V11a3 3 0 0 0 6 0V6.5a3 3 0 0 0-3-3z" />
    <Path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
  </Line>
);
// Hifdh «Revision» (two arrows going round) and «History» (a calendar)
// Hifdh (a book with a bookmark) and My plans (a checklist)
export const HifdhIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M10 2v8l3-3 3 3V2" />
    <Path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
  </Line>
);
export const PlansIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M3 17l2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8" />
  </Line>
);
export const RepeatIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M17 2.5l3 3-3 3M4 11V9.5a4 4 0 0 1 4-4h12M7 21.5l-3-3 3-3M20 13v1.5a4 4 0 0 1-4 4H4" />
  </Line>
);
export const CalendarIcon = (p: IconProps) => (
  <Line {...p}>
    <Path d="M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5zM8 3v4M16 3v4M4 10h16" />
  </Line>
);
export const PauseIcon = (p: IconProps) => (
  <Line {...p} strokeWidth={3}>
    <Path d="M8 5.5v13M16 5.5v13" />
  </Line>
);

export function CollapseIcon({ size = 22, color, strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
    </Svg>
  );
}
