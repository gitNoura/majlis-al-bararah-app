// The app's ornament: fine geometric Islamic patterns (src/lib/pattern.ts) instead of drawn scenes. One surface, three layers:
//   the ground      a pale wash of the page's colour family by day, a deep blue-black at night
//   the lattice     a repeating star / honeycomb / circles pattern in one hairline, faint, fading out where words go
//   the medallion   a rosette (with the subject's line icon, a sun or a crescent in its middle) at one place on the surface
// Used by the Adhkar (the daily cards, the categories' tiles and pages) and by the Hadith pages' headings.
import { useId, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

import { Art } from '@/components/AdhkarArt';
import { crescent, lattice, rays, rosette, type PatternKind } from '@/lib/pattern';

export type Look = { top: string; bottom: string; ink: string; glow: string; opacity: number };

// day and night, by colour family: [ground top, ground bottom, ink of the lines, the medallion's disc]
export const NIGHT: Look = { top: '#2a3160', bottom: '#1d2244', ink: '#f6e7c1', glow: '#2f3769', opacity: 0.17 };
export function dayLook(wash: string, ink: string): Look {
  return { top: wash, bottom: wash, ink, glow: '#ffffff', opacity: 0.22 };
}

type Place = 'center' | 'end' | 'none';

// `symbol`: what is in the medallion's middle - a line icon of the Adhkar's (`icon`), the morning's sun or the evening's crescent
export function PatternScene({
  kind,
  look,
  width,
  height,
  mirrored,
  tall,
  place = 'none',
  symbol,
  icon,
  slashed,
  fade,
  children,
}: {
  kind: PatternKind;
  look: Look;
  width: number;
  height: number;
  mirrored?: boolean;
  tall?: boolean;
  place?: Place;
  symbol?: 'sun' | 'moon';
  icon?: string;
  slashed?: boolean; // only the part beyond a slanting line (the evening half of «morning and evening»)
  fade?: 'bottom' | 'top' | 'none';
  children?: ReactNode;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const cell = tall ? 52 : Math.max(26, Math.min(40, Math.round(Math.min(width, height) / 3.2)));
  const mid = place === 'center';
  const R = mid ? Math.min(width, height) * 0.4 : height * 0.36;
  const edge = R + height * 0.1; // the medallion sits whole inside the surface, at the end of the line
  const cx = mid ? width / 2 : mirrored ? edge : width - edge;
  const cy = height * 0.5;
  const clip = slashed ? `${width * 0.58},0 ${width},0 ${width},${height} ${width * 0.42},${height}` : null;
  const strokeW = tall ? 1.1 : 0.9;
  const showMedallion = place !== 'none' && R > 14;
  const iconSize = R * 1.05;
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={look.top} />
            <Stop offset="1" stopColor={look.bottom} />
          </LinearGradient>
          {/* the lattice fades out towards one edge, so what is written over it stays easy to read */}
          <LinearGradient id={`f${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={look.bottom} stopOpacity={fade === 'top' ? 0.92 : 0} />
            <Stop offset="1" stopColor={look.bottom} stopOpacity={fade === 'bottom' ? 0.92 : 0} />
          </LinearGradient>
          {clip && (
            <ClipPath id={`c${id}`}>
              <Polygon points={clip} />
            </ClipPath>
          )}
        </Defs>
        <G clipPath={clip ? `url(#c${id})` : undefined}>
          <Rect width={width} height={height} fill={`url(#g${id})`} />
          <Path d={lattice(kind, width, height, cell)} fill="none" stroke={look.ink} strokeOpacity={look.opacity} strokeWidth={strokeW} strokeLinejoin="round" />
          {fade && fade !== 'none' && <Rect width={width} height={height} fill={`url(#f${id})`} />}
          {showMedallion && (
            <G>
              <Circle cx={cx} cy={cy} r={R * 1.04} fill={look.glow} fillOpacity={look.glow === '#ffffff' ? 0.72 : 0.9} />
              <Path d={rosette(cx, cy, R)} fill="none" stroke={look.ink} strokeOpacity={0.75} strokeWidth={strokeW + 0.2} strokeLinejoin="round" />
              {symbol === 'sun' && (
                <>
                  <Circle cx={cx} cy={cy} r={R * 0.3} fill="#e6b95a" />
                  <Path d={rays(cx, cy, R * 0.38, R * 0.5)} stroke={look.ink} strokeOpacity={0.8} strokeWidth={1.4} strokeLinecap="round" />
                </>
              )}
              {symbol === 'moon' && <Path d={crescent(cx, cy, R * 0.46)} fill={look.ink} fillOpacity={0.95} />}
            </G>
          )}
        </G>
      </Svg>
      {showMedallion && !!icon && (
        <View pointerEvents="none" style={{ position: 'absolute', left: cx - iconSize / 2, top: cy - iconSize / 2, width: iconSize, height: iconSize, alignItems: 'center', justifyContent: 'center' }}>
          <Art name={icon} scene color={look.ink} size={iconSize * 0.66} width={1.3} />
        </View>
      )}
      {children}
    </View>
  );
}
