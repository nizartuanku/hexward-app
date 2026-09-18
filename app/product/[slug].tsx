import { Redirect, useLocalSearchParams } from 'expo-router';
/** Deep link target: hexward://product/<slug> (0-tap path from LinkedIn/shorts/QR). */
export default function ProductLink() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <Redirect href={{ pathname: '/(tabs)/products/[slug]', params: { slug: String(slug) } }} />;
}
