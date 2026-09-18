import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { AppStateProvider, useApp } from '@/state/AppState';
import { ToastProvider } from '@/state/Toast';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const { p, scheme } = useTheme();
  const { ready } = useApp();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold });
  useEffect(() => { if (ready && fontsLoaded) SplashScreen.hideAsync().catch(() => {}); }, [ready, fontsLoaded]);
  if (!ready || !fontsLoaded) return null;
  return (
    <ToastProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: p.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="settings" options={{ presentation: 'card' }} />
      </Stack>
    </ToastProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppStateProvider>
            <Shell />
          </AppStateProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
