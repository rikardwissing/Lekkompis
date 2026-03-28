import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { glass } from '@/theme/glass';
import { GlassSurface } from '@/components/ui/GlassSurface';

export function SelectableChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.base, selected ? styles.selected : styles.unselected, pressed ? styles.pressed : null]}
    >
      {selected ? (
        <Text style={[styles.text, styles.selectedText]}>{label}</Text>
      ) : (
        <GlassSurface glassEffectStyle="clear" style={styles.unselectedSurface}>
          <Text style={[styles.text, styles.unselectedText]}>{label}</Text>
        </GlassSurface>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  selected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  unselected: {},
  unselectedSurface: {
    ...glass.panelMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.86,
  },
  selectedText: {
    color: colors.text,
  },
  unselectedText: {
    color: colors.text,
  },
});
