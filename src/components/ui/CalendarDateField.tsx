import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type CalendarMode = 'date' | 'month';

type CalendarDateFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  mode?: CalendarMode;
  onChange: (value: string) => void;
  formatValue?: (value: string) => string;
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (value: number) => String(value).padStart(2, '0');

const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day, 12);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
};

const parseIsoMonth = (value: string) => {
  const [year, month] = value.split('-').map((part) => Number.parseInt(part, 10));

  if (!year || !month || month < 1 || month > 12) {
    return null;
  }

  return { year, month };
};

const getMonthDays = (monthCursor: Date) => {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - offset + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

    return new Date(year, month, dayNumber, 12);
  });
};

export const formatCalendarDateLabel = (value: string) => {
  const date = parseIsoDate(value);

  if (!date) {
    return '';
  }

  const weekdayIndex = (date.getDay() + 6) % 7;
  return `${WEEKDAYS[weekdayIndex]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
};

export const formatCalendarMonthLabel = (value: string) => {
  const parsed = parseIsoMonth(value);

  if (!parsed) {
    return '';
  }

  return `${MONTHS[parsed.month - 1]} ${parsed.year}`;
};

export function CalendarDateField({
  label,
  placeholder = 'Pick a date',
  value,
  mode = 'date',
  onChange,
  formatValue,
}: CalendarDateFieldProps) {
  const selectedDate = useMemo(() => (mode === 'date' ? parseIsoDate(value) : null), [mode, value]);
  const selectedMonth = useMemo(() => (mode === 'month' ? parseIsoMonth(value) : null), [mode, value]);
  const [isOpen, setIsOpen] = useState(false);
  const [cursor, setCursor] = useState<Date>(() => {
    if (selectedDate) {
      return selectedDate;
    }

    if (selectedMonth) {
      return new Date(selectedMonth.year, selectedMonth.month - 1, 1);
    }

    return new Date();
  });

  const monthDays = useMemo(() => getMonthDays(cursor), [cursor]);
  const displayValue = value.length > 0 ? formatValue?.(value) ?? (mode === 'month' ? formatCalendarMonthLabel(value) : formatCalendarDateLabel(value)) : '';

  const openPicker = () => {
    if (selectedDate) {
      setCursor(selectedDate);
    } else if (selectedMonth) {
      setCursor(new Date(selectedMonth.year, selectedMonth.month - 1, 1));
    } else {
      setCursor(new Date());
    }

    setIsOpen(true);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={openPicker}
        style={({ pressed }) => [styles.trigger, pressed ? styles.pressed : null]}
      >
        <Text style={displayValue ? styles.value : styles.placeholder}>{displayValue || placeholder}</Text>
        <View style={styles.actions}>
          {value ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => onChange('')}
              style={({ pressed }) => [styles.clearAction, pressed ? styles.pressed : null]}
            >
              <Text style={styles.clearActionText}>Clear</Text>
            </Pressable>
          ) : null}
          <Text style={styles.action}>{value ? 'Change' : 'Pick'}</Text>
        </View>
      </Pressable>

      <Modal animationType="fade" onRequestClose={() => setIsOpen(false)} transparent visible={isOpen}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setCursor((current) =>
                    mode === 'month'
                      ? new Date(current.getFullYear() - 1, current.getMonth(), 1)
                      : new Date(current.getFullYear(), current.getMonth() - 1, 1)
                  )
                }
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>

              <Text style={styles.monthLabel}>
                {mode === 'month' ? cursor.getFullYear() : `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setCursor((current) =>
                    mode === 'month'
                      ? new Date(current.getFullYear() + 1, current.getMonth(), 1)
                      : new Date(current.getFullYear(), current.getMonth() + 1, 1)
                  )
                }
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>
            </View>

            {mode === 'date' ? (
              <>
                <View style={styles.weekHeader}>
                  {WEEKDAYS.map((dayLabel) => (
                    <Text key={dayLabel} style={styles.weekday}>
                      {dayLabel}
                    </Text>
                  ))}
                </View>
                <View style={styles.dayGrid}>
                  {monthDays.map((date, index) => {
                    if (!date) {
                      return <View key={`empty-${index}`} style={styles.emptyDay} />;
                    }

                    const isoDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
                    const isSelected = isoDate === value;

                    return (
                      <Pressable
                        key={isoDate}
                        accessibilityRole="button"
                        onPress={() => {
                          onChange(isoDate);
                          setIsOpen(false);
                        }}
                        style={({ pressed }) => [styles.day, isSelected ? styles.daySelected : null, pressed ? styles.pressed : null]}
                      >
                        <Text style={isSelected ? styles.dayTextSelected : styles.dayText}>{date.getDate()}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : (
              <View style={styles.monthGrid}>
                {MONTHS.map((monthLabel, index) => {
                  const isoMonth = `${cursor.getFullYear()}-${pad(index + 1)}`;
                  const isSelected = isoMonth === value;

                  return (
                    <Pressable
                      key={monthLabel}
                      accessibilityRole="button"
                      onPress={() => {
                        onChange(isoMonth);
                        setIsOpen(false);
                      }}
                      style={({ pressed }) => [styles.monthChip, isSelected ? styles.monthChipSelected : null, pressed ? styles.pressed : null]}
                    >
                      <Text style={isSelected ? styles.monthChipTextSelected : styles.monthChipText}>{monthLabel}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
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
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  trigger: {
    minHeight: 54,
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
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  action: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  clearAction: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  clearActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
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
    shadowColor: colors.shadow,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthLabel: {
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
  weekHeader: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.xs,
  },
  day: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  dayTextSelected: {
    fontSize: 14,
    color: colors.background,
    fontWeight: '700',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  monthChip: {
    width: '31%',
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  monthChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  monthChipTextSelected: {
    fontSize: 14,
    color: colors.background,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
});
