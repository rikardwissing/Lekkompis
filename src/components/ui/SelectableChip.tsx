import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { glass } from '@/theme/glass';

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
      <Text style={[styles.text, selected ? styles.selectedText : styles.unselectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  selected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  unselected: {
    ...glass.panelMuted,
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
