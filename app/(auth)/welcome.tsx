import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function WelcomeScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <LinearGradient colors={[colors.primarySoft, '#F6EFE5']} style={styles.hero}>
          <Text style={styles.kicker}>Lekkompis</Text>
          <Text style={styles.title}>Meet nearby parents for simple, safe first meetups.</Text>
          <Text style={styles.subtitle}>
            A warm, local way to find nearby parents whose family stage feels like a fit, and whose company feels easy to meet.
          </Text>
        </LinearGradient>

        <View style={styles.trustPanel}>
          <Text style={styles.trustTitle}>Designed to feel calm and trustworthy</Text>
          <Text style={styles.trustCopy}>Approximate areas only. Public-place-first tone. Modern iOS experience.</Text>
        </View>

        <View style={styles.actions}>
          <Button label="Continue" onPress={() => router.push('/(auth)/onboarding')} />
          <Button label="Open demo" variant="secondary" onPress={() => router.push('/(tabs)/discover')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  hero: {
    borderRadius: 28,
    padding: spacing.xxl,
    gap: spacing.lg,
    minHeight: 320,
    justifyContent: 'flex-end',
  },
  kicker: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
  trustPanel: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  trustTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  trustCopy: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.md,
  },
});
