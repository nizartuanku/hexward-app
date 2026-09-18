import React from 'react';
import { useRouter } from 'expo-router';
import { Screen, EmptyState } from '@/components/Primitives';
import { TopBar } from '@/components/Chrome';
export default function NotFound() {
  const router = useRouter();
  return (<Screen scroll={false}><TopBar title="Not found" back /><EmptyState icon="search" title="This screen does not exist" action="Go home" onAction={() => router.replace('/(tabs)/home')} /></Screen>);
}
