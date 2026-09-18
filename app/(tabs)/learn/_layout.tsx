import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';

export default function Layout() {
  const { p } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: p.bg }, animation: 'slide_from_right' }} />;
}
