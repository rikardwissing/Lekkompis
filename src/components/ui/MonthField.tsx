import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { formatMonthOnly, isValidMonthOnly } from '@/utils/birthdays';

type MonthFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parseMonthYear = (value: string) => {
  const [year, month] = value.split('-').map((part) => Number.parseInt(part, 10));

  if (!year || !month) {
    return null;
  }

  return { year, month };
};

export function MonthField({ label, placeholder = 'Add due month', value, onChange }: MonthFieldProps) {
  const parsed = useMemo(() => parseMonthYear(value), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [yearCursor, setYearCursor] = useState(parsed?.year ?? new Date().getFullYear());

  const openPicker = () => {
    setYearCursor(parsed?.year ?? new Date().getFullYear());
    setIsOpen(true);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {value ? (
          <Pressable accessibilityRole="button" onPress={() => onChange('')}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable accessibilityRole="button" onPress={openPicker} style={({ pressed }) => [styles.trigger, pressed ? styles.pressed : null]}>
        <Text style={value ? styles.value : styles.placeholder}>{value ? formatMonthOnly(value) : placeholder}</Text>
        <Text style={styles.action}>{value ? 'Edit' : 'Pick'}</Text>
      </Pressable>

      <Modal animationType="fade" onRequestClose={() => setIsOpen(false)} transparent visible={isOpen}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <View style={styles.modalHeader}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setYearCursor((current) => current - 1)}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>
              <Text style={styles.yearLabel}>{yearCursor}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setYearCursor((current) => current + 1)}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.monthGrid}>
              {MONTHS.map((monthLabel, index) => {
                const monthNumber = index + 1;
                const monthValue = `${yearCursor}-${String(monthNumber).padStart(2, '0')}`;
                const isSelected = monthValue === value;

                return (
                  <Pressable
                    key={monthLabel}
                    accessibilityRole="button"
                    onPress={() => {
                      if (isValidMonthOnly(monthValue)) {
                        onChange(monthValue);
                        setIsOpen(false);
                      }
                    }}
                    style={({ pressed }) => [styles.monthItem, isSelected ? styles.monthSelected : null, pressed ? styles.pressed : null]}
                  >
                    <Text style={isSelected ? styles.monthTextSelected : styles.monthText}>{monthLabel}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  clear: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
  },
  trigger: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
    color: colors.textMuted,
  },
  action: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 42, 36, 0.35)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  navButton: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  navButtonText: {
    fontSize: 22,
    lineHeight: 24,
    color: colors.text,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
    columnGap: spacing.sm,
  },
  monthItem: {
    width: '31%',
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  monthTextSelected: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
  },
  pressed: {
    opacity: 0.82,
  },
});
