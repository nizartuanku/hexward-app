import { Redirect } from 'expo-router';
import { useApp } from '@/state/AppState';

/** Welcome is shown once (decision 18 Sep 2026); returning users land on Home (06 paired / 08 not paired). */
export default function Index() {
  const { welcomeSeen } = useApp();
  return <Redirect href={welcomeSeen ? '/(tabs)/home' : '/welcome'} />;
}
