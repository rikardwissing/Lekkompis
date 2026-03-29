import { Redirect, useLocalSearchParams } from 'expo-router';

export default function LegacyPlanDetailRedirect() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (!id) {
    return <Redirect href="/(tabs)/plans" />;
  }

  return <Redirect href={{ pathname: '/group/[id]', params: { id } }} />;
}
