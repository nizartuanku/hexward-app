import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { useTheme } from '@/theme/ThemeContext';
import { Icon, type IconName } from '@/icons/Icon';
import { Text } from './Text';

const TABS: Record<string, { label: string; icon: IconName }> = {
  home: { label: 'Home', icon: 'home' },
  console: { label: 'Console', icon: 'console' },
  tools: { label: 'Tools', icon: 'tools' },
  learn: { label: 'Learn', icon: 'learn' },
  products: { label: 'Products', icon: 'products' },
};

/** iOS: HIG tab bar 49 + home indicator area. Android: Material 3 navigation bar 80 with indicator pill. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { p, ios } = useTheme();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, ios ? 34 : 0);
  return (
    <View style={{ backgroundColor: ios ? p.tabBar : p.surface, borderTopWidth: 1, borderTopColor: p.border, paddingBottom: bottom }}>
      <View style={{ flexDirection: 'row', height: ios ? 49 : 80 }}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const meta = TABS[route.name] ?? { label: route.name, icon: 'products' as IconName };
          const color = focused ? p.accent : ios ? p.text3 : p.text2;
          const onPress = () => {
            const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !e.defaultPrevented) navigation.navigate(route.name, route.params);
          };
          return (
            <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={meta.label} onPress={onPress}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: ios ? 2 : 4 }}>
              {ios ? (
                <Icon name={meta.icon} size={24} color={color} strokeWidth={focused ? 2 : 1.6} />
              ) : (
                <View style={{ width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? p.accentSoft : 'transparent' }}>
                  <Icon name={meta.icon} size={24} color={color} strokeWidth={focused ? 2 : 1.6} />
                </View>
              )}
              <Text v="caption" semibold style={{ color, fontSize: ios ? 10 : 12, lineHeight: ios ? 12 : 16 }}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {ios ? <View style={{ position: 'absolute', bottom: 8, alignSelf: 'center', width: 134, height: 5, borderRadius: 3, backgroundColor: p.text, opacity: 0.6 }} /> : null}
    </View>
  );
}
