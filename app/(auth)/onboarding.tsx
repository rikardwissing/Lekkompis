import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const steps = [
  ['Local first', 'Discover nearby parents and families by area, not exact address.'],
  ['A good family fit', 'See children\'s ages, expecting stage, and parent vibe together with practical preferences.'],
  ['Easy first meetup', 'Start with chat and plan a calm first meetup that fits your family stage.'],
] as const;

export default function OnboardingScreen() {
  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>A calmer way to start local family connections</Text>
        <Text style={styles.subtitle}>Built for iPhone first, with a warm and modern interface for early demos.</Text>
      </View>
      {steps.map(([title, copy], index) => (
        <Card key={title}>
          <Text style={styles.step}>0{index + 1}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardCopy}>{copy}</Text>
        </Card>
      ))}
      <Button label="Set up profile" onPress={() => router.push('/(setup)/parent-profile')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
  step: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  cardCopy: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
