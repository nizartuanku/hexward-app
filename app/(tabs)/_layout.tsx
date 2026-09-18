import React from 'react';
import { Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, lazy: true }} backBehavior="history">
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="console" options={{ title: 'Console' }} />
      <Tabs.Screen name="tools" options={{ title: 'Tools' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="products" options={{ title: 'Products' }} />
    </Tabs>
  );
}
