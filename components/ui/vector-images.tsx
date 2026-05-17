import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type VectorProps = {
  size?: number;
  color?: string;
  secondaryColor?: string;
};

export function HomeVector({ size = 26, color = '#0ea5e9', secondaryColor = '#bae6fd' }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10.5L12 3l9 7.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 9.5V20a1 1 0 001 1h12a1 1 0 001-1V9.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Rect x="9" y="13" width="6" height="8" rx="1.2" fill={secondaryColor} />
    </Svg>
  );
}

export function CustomersVector({ size = 26, color = '#0ea5e9', secondaryColor = '#bae6fd' }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="3" stroke={color} strokeWidth={1.8} />
      <Circle cx="16.5" cy="9" r="2.5" stroke={color} strokeWidth={1.6} />
      <Path d="M3 18c0-2.6 2.7-4.5 6-4.5s6 1.9 6 4.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M13.5 18c.1-1.7 1.8-3 4-3 2.4 0 4.5 1.4 4.5 3" stroke={secondaryColor} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ProfileVector({ size = 26, color = '#0ea5e9', secondaryColor = '#bae6fd' }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.2" stroke={color} strokeWidth={1.9} />
      <Path d="M5 19c0-2.9 3.1-5 7-5s7 2.1 7 5" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Circle cx="18.5" cy="5.5" r="2.5" fill={secondaryColor} />
      <Path d="M18.5 4.3v2.4M17.3 5.5h2.4" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

export function LedgerBadgeVector({ size = 52, color = '#0ea5e9', secondaryColor = '#e0f2fe' }: VectorProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <Rect x="2" y="2" width="48" height="48" rx="14" fill={secondaryColor} stroke={color} strokeWidth={2} />
      <Rect x="12" y="13" width="28" height="4" rx="2" fill={color} />
      <Rect x="12" y="22" width="20" height="4" rx="2" fill={color} opacity={0.85} />
      <Rect x="12" y="31" width="24" height="4" rx="2" fill={color} opacity={0.7} />
      <Path d="M34 28.5c2.2 0 4 1.8 4 4s-1.8 4-4 4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
