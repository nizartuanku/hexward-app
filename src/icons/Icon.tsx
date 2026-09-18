import React from 'react';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';

/** Line icons, 24×24 viewBox, 1.6 stroke — one set for iOS and Android (KIT §4/§5). */
export type IconName =
  | 'home' | 'console' | 'tools' | 'learn' | 'products'
  | 'bell' | 'gear' | 'chevronRight' | 'chevronLeft' | 'chevronDown' | 'search' | 'qr' | 'play' | 'check' | 'x'
  | 'external' | 'copy' | 'share' | 'filter' | 'clock' | 'refresh' | 'plus' | 'more' | 'arrowRight'
  | 'camera' | 'keyboard' | 'download' | 'wifiOff' | 'link' | 'mail' | 'globe' | 'lock' | 'star' | 'trash' | 'sliders'
  | 'sevCritical' | 'sevHigh' | 'sevMedium' | 'sevLow' | 'sevInfo'
  | 'rulehawk' | 'ruleforge' | 'loglight' | 'topolight' | 'certlight' | 'asm' | 'decoy' | 'patchlight'
  | 'dmarcwatch' | 'tenantwatch' | 'auditlight' | 'posture' | 'nibble' | 'book' | 'video' | 'shield' | 'server' | 'key' | 'bookmark' | 'github';

export function Icon({ name, size = 24, color, strokeWidth = 1.6 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const { p } = useTheme();
  const c = color ?? p.text;
  const common = { stroke: c, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };
  const body = () => {
    switch (name) {
      case 'home': return <><Path d="M4 11l8-7 8 7" /><Path d="M6 10v10h12V10" /><Path d="M10 20v-6h4v6" /></>;
      case 'console': return <><Rect x="4" y="4" width="6" height="6" rx="1.5" /><Rect x="14" y="4" width="6" height="6" rx="1.5" /><Rect x="4" y="14" width="6" height="6" rx="1.5" /><Path d="M14.5 17.5l2 2 3.5-4" /></>;
      case 'tools': return <><Path d="M14.5 5.5a4 4 0 0 0-5 5L4 16l4 4 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2-2z" /></>;
      case 'learn': return <><Path d="M4 5.5A2 2 0 0 1 6 4h4a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z" /><Path d="M20 5.5A2 2 0 0 0 18 4h-4a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" /><Path d="M15 8.5v5l3.5-2.5z" fill={c} /></>;
      case 'products': return <Polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5" />;
      case 'nibble': return <><Polygon points="12,2 21.3,7.4 21.3,16.6 12,22 2.7,16.6 2.7,7.4" strokeWidth={strokeWidth + 0.2} /><Rect x="7.2" y="7.2" width="4.2" height="4.2" rx="0.9" fill={c} strokeWidth={1} /><Rect x="12.6" y="7.2" width="4.2" height="4.2" rx="0.9" strokeWidth={1} /><Rect x="7.2" y="12.6" width="4.2" height="4.2" rx="0.9" strokeWidth={1} /><Rect x="12.6" y="12.6" width="4.2" height="4.2" rx="0.9" fill={c} strokeWidth={1} /></>;
      case 'bell': return <><Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><Path d="M10 20a2 2 0 0 0 4 0" /></>;
      case 'gear': return <><Circle cx="12" cy="12" r="3" /><Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>;
      case 'chevronRight': return <Path d="M9 6l6 6-6 6" />;
      case 'chevronLeft': return <Path d="M15 6l-6 6 6 6" />;
      case 'chevronDown': return <Path d="M6 9l6 6 6-6" />;
      case 'search': return <><Circle cx="11" cy="11" r="6.5" /><Path d="M16 16l4.5 4.5" /></>;
      case 'qr': return <><Rect x="4" y="4" width="6" height="6" rx="1" /><Rect x="14" y="4" width="6" height="6" rx="1" /><Rect x="4" y="14" width="6" height="6" rx="1" /><Path d="M14 14h2v2h-2zM18 14h2M14 18h2v2M18 18h2v2" /></>;
      case 'play': return <Path d="M8 5.5v13l10-6.5z" fill={c} />;
      case 'check': return <Path d="M5 12.5l4.5 4.5L19 7.5" />;
      case 'x': return <Path d="M6 6l12 12M18 6L6 18" />;
      case 'external': return <><Path d="M14 4h6v6" /><Path d="M20 4l-9 9" /><Path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></>;
      case 'copy': return <><Rect x="9" y="9" width="11" height="11" rx="2" /><Path d="M5 15V5a1 1 0 0 1 1-1h10" /></>;
      case 'share': return <><Path d="M12 3v12" /><Path d="M8 7l4-4 4 4" /><Path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" /></>;
      case 'filter': return <Path d="M4 5h16l-6.5 8v6l-3-1.5V13z" />;
      case 'clock': return <><Circle cx="12" cy="12" r="8.5" /><Path d="M12 7.5V12l3 2" /></>;
      case 'refresh': return <><Path d="M4 12a8 8 0 1 0 2.4-5.7" /><Path d="M4 4v5h5" /></>;
      case 'plus': return <Path d="M12 5v14M5 12h14" />;
      case 'more': return <><Circle cx="6" cy="12" r="1.4" fill={c} /><Circle cx="12" cy="12" r="1.4" fill={c} /><Circle cx="18" cy="12" r="1.4" fill={c} /></>;
      case 'arrowRight': return <><Path d="M5 12h14" /><Path d="M13 6l6 6-6 6" /></>;
      case 'camera': return <><Path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><Circle cx="12" cy="13" r="3.5" /></>;
      case 'keyboard': return <><Rect x="3" y="6" width="18" height="12" rx="2" /><Path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" /></>;
      case 'download': return <><Path d="M12 4v11" /><Path d="M7 10l5 5 5-5" /><Path d="M4 19h16" /></>;
      case 'wifiOff': return <><Path d="M3 3l18 18" /><Path d="M5 10a12 12 0 0 1 4-2.5M8.5 13.5a7 7 0 0 1 2.5-1.5M15.5 13.5a7 7 0 0 0-1-.8M19 10a12 12 0 0 0-8-3" /><Circle cx="12" cy="18" r="1" fill={c} /></>;
      case 'link': return <><Path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><Path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>;
      case 'mail': return <><Rect x="3" y="5" width="18" height="14" rx="2" /><Path d="M3 7l9 6 9-6" /></>;
      case 'globe': return <><Circle cx="12" cy="12" r="8.5" /><Path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17" /></>;
      case 'lock': return <><Rect x="5" y="10" width="14" height="10" rx="2" /><Path d="M8 10V7a4 4 0 0 1 8 0v3" /></>;
      case 'key': return <><Circle cx="8" cy="14" r="4" /><Path d="M11 11l8-8M16 6l2 2M13 9l2 2" /></>;
      case 'star': return <Polygon points="12,3.5 14.6,9 20.5,9.6 16,13.6 17.4,19.5 12,16.5 6.6,19.5 8,13.6 3.5,9.6 9.4,9" />;
      case 'trash': return <><Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>;
      case 'sliders': return <><Path d="M4 7h10M18 7h2M4 17h4M12 17h8M4 12h16" /><Circle cx="16" cy="7" r="2" /><Circle cx="10" cy="17" r="2" /></>;
      case 'book': return <><Path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><Path d="M4 19a2 2 0 0 1 2-2h13" /></>;
      case 'video': return <><Rect x="3" y="6" width="13" height="12" rx="2" /><Path d="M16 10l5-3v10l-5-3z" /></>;
      case 'shield': return <Path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />;
      case 'server': return <><Rect x="4" y="4" width="16" height="6" rx="1.5" /><Rect x="4" y="14" width="16" height="6" rx="1.5" /><Path d="M8 7h.01M8 17h.01" /></>;
      case 'bookmark': return <Path d="M6 4h12v17l-6-4-6 4z" />;
      case 'github': return <><Circle cx="12" cy="12" r="8.5" /><Path d="M9 20v-3c-3 .7-3.5-1.5-4.5-2M15 20v-3.5c0-1 .2-1.5-.5-2 2.5-.3 4.5-1.2 4.5-4.5 0-1-.3-1.8-.9-2.4.1-.3.4-1.3-.1-2.6 0 0-.8-.3-2.6 1a9 9 0 0 0-4.8 0c-1.8-1.3-2.6-1-2.6-1-.5 1.3-.2 2.3-.1 2.6-.6.6-.9 1.4-.9 2.4 0 3.3 2 4.2 4.5 4.5-.5.5-.5 1-.5 2" /></>;
      // severity: never color alone
      case 'sevCritical': return <><Polygon points="8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8" /><Path d="M12 8v5M12 16h.01" strokeWidth={2} /></>;
      case 'sevHigh': return <><Path d="M12 4l9 16H3z" /><Path d="M12 10v4M12 17h.01" strokeWidth={2} /></>;
      case 'sevMedium': return <><Circle cx="12" cy="12" r="8.5" /><Path d="M12 8v5M12 16h.01" strokeWidth={2} /></>;
      case 'sevLow': return <><Circle cx="12" cy="12" r="8.5" /><Path d="M12 11v5M12 8h.01" strokeWidth={2} /></>;
      case 'sevInfo': return <Circle cx="12" cy="12" r="8.5" />;
      // products (KIT §5)
      case 'rulehawk': return <><Path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><Path d="M9 12l2 2 4-4" /></>;
      case 'ruleforge': return <><Path d="M4 6h6l3 6-3 6H4" /><Path d="M20 6h-3l-3 6 3 6h3" /><Path d="M13 12h4" /></>;
      case 'loglight': return <><Path d="M5 6h9M5 12h6M5 18h8" /><Path d="M17 9l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill={c} /></>;
      case 'topolight': return <><Circle cx="6" cy="17" r="2.5" /><Circle cx="18" cy="17" r="2.5" /><Circle cx="12" cy="6" r="2.5" /><Path d="M8 15.5l3-7M16 15.5l-3-7M8.5 17h7" /></>;
      case 'certlight': return <><Rect x="4" y="10" width="11" height="9" rx="2" /><Path d="M6.5 10V7.5a3 3 0 0 1 6 0V10" /><Circle cx="17.5" cy="16.5" r="3.5" /><Path d="M17.5 14.8v1.8l1.2.8" /></>;
      case 'asm': return <><Circle cx="12" cy="12" r="8.5" /><Circle cx="12" cy="12" r="4.5" /><Circle cx="12" cy="12" r="1" fill={c} /><Path d="M12 3.5V7M20.5 12H17" /></>;
      case 'decoy': return <><Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><Path d="M10 20a2 2 0 0 0 4 0" /><Circle cx="18" cy="5.5" r="2" fill={c} /></>;
      case 'patchlight': return <><Rect x="3.5" y="3.5" width="17" height="17" rx="3" /><Path d="M12 8v8M8 12h8" /></>;
      case 'dmarcwatch': return <><Path d="M3 7v10a2 2 0 0 0 2 2h8" /><Path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5" /><Path d="M3 7l9 6 9-6" /><Path d="M15 17.5l2 2 4-4" /></>;
      case 'tenantwatch': return <><Path d="M4 20V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v6" /><Path d="M8 8h3M8 12h3M8 16h3" /><Path d="M14 17.5l2 2 4-4" /><Path d="M4 20h9" /></>;
      case 'auditlight': return <><Rect x="5" y="4" width="14" height="17" rx="2" /><Path d="M9 4h6v2.5H9z" /><Path d="M8.5 13.5l2.5 2.5 4.5-5" /></>;
      case 'posture': return <><Path d="M6 3h8l4 4v14H6z" /><Path d="M14 3v4h4" /><Path d="M9 17v-4M12 17v-6M15 17v-2.5" /></>;
      default: return <Circle cx="12" cy="12" r="8" />;
    }
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common}>
      {body()}
    </Svg>
  );
}

/** Product slug → icon name (KIT §5). */
export const productIcon: Record<string, IconName> = {
  rulehawk: 'rulehawk', ruleforge: 'ruleforge', loglight: 'loglight', topolight: 'topolight', certlight: 'certlight',
  asm: 'asm', decoy: 'decoy', patchlight: 'patchlight', dmarcwatch: 'dmarcwatch', tenantwatch: 'tenantwatch',
  auditlight: 'auditlight', 'posture-report': 'posture', suite: 'nibble', essentials: 'nibble',
};

export const severityIcon: Record<string, IconName> = {
  critical: 'sevCritical', high: 'sevHigh', medium: 'sevMedium', low: 'sevLow', info: 'sevInfo',
};

export const NibbleMark = ({ size = 32, color }: { size?: number; color?: string }) => (
  <Icon name="nibble" size={size} color={color} strokeWidth={1.8} />
);

export { Line, Polyline };
