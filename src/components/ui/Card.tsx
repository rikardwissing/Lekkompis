import { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { glass } from '@/theme/glass';
import { GlassSurface } from '@/components/ui/GlassSurface';

export function Card({ children }: PropsWithChildren) {
  return <GlassSurface style={styles.card}>{children}</GlassSurface>;
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
