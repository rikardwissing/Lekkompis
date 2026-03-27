import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { glass } from '@/theme/glass';

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    ...glass.panel,
    ...glass.elevatedShadow,
  },
});
