import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

export function TextField({
  label,
  value,
  onChangeText,
  multiline = false,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, multiline && styles.multiline]}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  multiline: {
    minHeight: 108,
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
  },
});
