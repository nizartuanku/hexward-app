import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fonts, type as ts } from '@/theme/tokens';

export type TextVariant = 'largeTitle' | 'title' | 'headline' | 'body' | 'callout' | 'caption' | 'label' | 'mono';
export type TextTone = 'text' | 'text2' | 'text3' | 'accent' | 'onAccent' | 'critical' | 'high' | 'medium' | 'low' | 'ok';

export interface TextProps extends RNTextProps {
  v?: TextVariant;
  tone?: TextTone;
  semibold?: boolean;
  num?: boolean;
  center?: boolean;
}

export function Text({ v = 'body', tone = 'text', semibold, num, center, style, ...rest }: TextProps) {
  const { p, ios, body } = useTheme();
  let s: TextStyle;
  switch (v) {
    case 'largeTitle':
      s = { fontSize: ios ? ts.xxl : ts.lg, lineHeight: ios ? 41 : 28, fontFamily: ios ? fonts.semibold : fonts.regular, letterSpacing: ios ? -0.4 : 0 };
      break;
    case 'title':
      s = { fontSize: ts.lg, lineHeight: 28, fontFamily: fonts.semibold, letterSpacing: -0.2 };
      break;
    case 'headline':
      s = { fontSize: body, lineHeight: Math.round(body * 1.3), fontFamily: fonts.semibold };
      break;
    case 'callout':
      s = { fontSize: ts.sm, lineHeight: 20, fontFamily: fonts.regular };
      break;
    case 'caption':
      s = { fontSize: ts.xs, lineHeight: 17, fontFamily: fonts.regular };
      break;
    case 'label':
      s = { fontSize: 11, lineHeight: 14, fontFamily: fonts.semibold, letterSpacing: 0.5, textTransform: 'uppercase' };
      break;
    case 'mono':
      s = { fontSize: ts.sm, lineHeight: 20, fontFamily: fonts.mono, fontVariant: ['tabular-nums'] };
      break;
    default:
      s = { fontSize: body, lineHeight: Math.round(body * 1.3), fontFamily: fonts.regular };
  }
  if (semibold) s.fontFamily = fonts.semibold;
  if (num) s.fontVariant = ['tabular-nums'];
  if (center) s.textAlign = 'center';
  const color = tone === 'text' ? p.text : tone === 'text2' ? p.text2 : tone === 'text3' ? p.text3 : tone === 'accent' ? p.accent : tone === 'onAccent' ? p.onAccent : tone === 'critical' ? p.critical : tone === 'high' ? p.high : tone === 'medium' ? p.medium : tone === 'low' ? p.low : p.ok;
  return <RNText {...rest} style={[s, { color }, style]} />;
}
