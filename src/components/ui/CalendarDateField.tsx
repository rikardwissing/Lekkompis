import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type CalendarDateFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromIsoDate = (value: string) => {
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

export const formatCalendarDateLabel = (value: string) => {
  const date = fromIsoDate(value);

  if (!date) {
    return '';
  }

  const weekdayIndex = (date.getDay() + 6) % 7;
  return `${WEEKDAYS[weekdayIndex]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
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

export function CalendarDateField({ label, placeholder = 'Pick a date', value, onChange }: CalendarDateFieldProps) {
  const selectedDate = useMemo(() => fromIsoDate(value), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState<Date>(() => selectedDate ?? new Date());

  const monthDays = useMemo(() => getMonthDays(monthCursor), [monthCursor]);

  const openPicker = () => {
    setMonthCursor(selectedDate ?? new Date());
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
        <Text style={value ? styles.value : styles.placeholder}>{value ? formatCalendarDateLabel(value) : placeholder}</Text>
        <Text style={styles.action}>{value ? 'Change' : 'Pick'}</Text>
      </Pressable>

      <Modal animationType="fade" onRequestClose={() => setIsOpen(false)} transparent visible={isOpen}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <View style={styles.modalHeader}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>
              <Text style={styles.monthLabel}>{MONTHS[monthCursor.getMonth()]} {monthCursor.getFullYear()}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekHeader}>
              {WEEKDAYS.map((dayLabel) => (
                <Text key={dayLabel} style={styles.weekday}>{dayLabel}</Text>
              ))}
            </View>

            <View style={styles.dayGrid}>
              {monthDays.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.emptyDay} />;
                }

                const dateIso = toIsoDate(date);
                const isSelected = dateIso === value;

                return (
                  <Pressable
                    key={dateIso}
                    accessibilityRole="button"
                    onPress={() => {
                      onChange(dateIso);
                      setIsOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.day,
                      isSelected ? styles.daySelected : null,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <Text style={isSelected ? styles.dayTextSelected : styles.dayText}>{date.getDate()}</Text>
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
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
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
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
    color: colors.textMuted,
  },
  action: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(31, 42, 36, 0.35)",
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.md,
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
    gap: spacing.xs,
  },
  day: {
    width: '13.4%',
    aspectRatio: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  emptyDay: {
    width: '13.4%',
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
  pressed: {
    opacity: 0.85,
  },
});
