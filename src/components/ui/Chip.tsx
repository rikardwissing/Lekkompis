import { StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { glass } from '@/theme/glass';
import { GlassSurface } from '@/components/ui/GlassSurface';

export function Chip({ label }: { label: string }) {
  return (
    <GlassSurface glassEffectStyle="clear" style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  chip: {
    ...glass.panelMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  text: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
