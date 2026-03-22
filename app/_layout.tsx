import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DevicePreview } from '@/components/ui/DevicePreview';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  return (
    <DevicePreview>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </DevicePreview>
  );
}
