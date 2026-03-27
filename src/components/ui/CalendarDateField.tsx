import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

type CalendarDateFieldProps = {
  label: string;
  placeholder?: string;
  helperText?: string;
  firstDayOfWeek?: number;
  value: string;
  onChange: (value: string) => void;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultFirstDayOfWeek = () => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const intlWithLocale = Intl as Intl & { Locale?: new (value: string) => { weekInfo?: { firstDay?: number } } };

    if (!intlWithLocale.Locale) {
      return 0;
    }

    const localeInfo = new intlWithLocale.Locale(locale);
    const weekInfoFirstDay = localeInfo.weekInfo?.firstDay;

    if (typeof weekInfoFirstDay === 'number') {
      return weekInfoFirstDay % 7;
    }
  } catch {
    return 0;
  }

  return 0;
};

const normalizeFirstDayOfWeek = (value: number | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return getDefaultFirstDayOfWeek();
  }

  const normalized = Math.floor(value) % 7;
  return normalized < 0 ? normalized + 7 : normalized;
};

const getWeekdayLabels = (firstDayOfWeek: number) =>
  Array.from({ length: 7 }, (_, offset) => WEEKDAYS[(firstDayOfWeek + offset) % 7]);

export const parseIsoDate = (value: string) => {
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
  const date = parseIsoDate(value);

  if (!date) {
    return '';
  }

  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
};

const getMonthDays = (monthCursor: Date, firstDayOfWeek: number) => {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() - firstDayOfWeek + 7) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - offset + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return null;
    }

    return new Date(year, month, dayNumber, 12);
  });
};

const getYearRange = (year: number) => {
  const startYear = Math.floor(year / 12) * 12;
  return Array.from({ length: 12 }, (_, index) => startYear + index);
};

export function CalendarDateField({ label, placeholder = 'Pick a date', helperText, firstDayOfWeek, value, onChange }: CalendarDateFieldProps) {
  const normalizedFirstDay = useMemo(() => normalizeFirstDayOfWeek(firstDayOfWeek), [firstDayOfWeek]);
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const todayIso = useMemo(() => toIsoDate(new Date()), []);
  const weekdayLabels = useMemo(() => getWeekdayLabels(normalizedFirstDay), [normalizedFirstDay]);
  const [isOpen, setIsOpen] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [monthCursor, setMonthCursor] = useState<Date>(() => selectedDate ?? new Date());

  const monthDays = useMemo(() => getMonthDays(monthCursor, normalizedFirstDay), [monthCursor, normalizedFirstDay]);
  const years = useMemo(() => getYearRange(monthCursor.getFullYear()), [monthCursor]);

  const openPicker = () => {
    setMonthCursor(selectedDate ?? new Date());
    setShowYearPicker(false);
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
        <Text style={value ? styles.value : styles.placeholder}>{value ? formatCalendarDateLabel(value) : placeholder}</Text>
        <Text style={styles.action}>{value ? 'Edit' : 'Pick'}</Text>
      </Pressable>
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}

      <Modal animationType="fade" onRequestClose={() => setIsOpen(false)} transparent visible={isOpen}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <View style={styles.modalHeader}>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setMonthCursor((current) =>
                    showYearPicker
                      ? new Date(current.getFullYear() - 12, current.getMonth(), 1)
                      : new Date(current.getFullYear(), current.getMonth() - 1, 1)
                  )
                }
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setShowYearPicker((current) => !current)}>
                <Text style={styles.monthLabel}>
                  {MONTHS[monthCursor.getMonth()]} {monthCursor.getFullYear()}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setMonthCursor((current) =>
                    showYearPicker
                      ? new Date(current.getFullYear() + 12, current.getMonth(), 1)
                      : new Date(current.getFullYear(), current.getMonth() + 1, 1)
                  )
                }
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>
            </View>

            {showYearPicker ? (
              <View style={styles.yearGrid}>
                {years.map((year) => {
                  const isSelected = year === monthCursor.getFullYear();

                  return (
                    <Pressable
                      key={year}
                      accessibilityRole="button"
                      onPress={() => {
                        setMonthCursor((current) => new Date(year, current.getMonth(), 1));
                        setShowYearPicker(false);
                      }}
                      style={({ pressed }) => [styles.yearItem, isSelected ? styles.yearSelected : null, pressed ? styles.pressed : null]}
                    >
                      <Text style={isSelected ? styles.yearTextSelected : styles.yearText}>{year}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <>
                <View style={styles.weekHeader}>
                  {weekdayLabels.map((dayLabel) => (
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

                    const dateIso = toIsoDate(date);
                    const isSelected = dateIso === value;
                    const isToday = dateIso === todayIso;

                    return (
                      <Pressable
                        key={dateIso}
                        accessibilityRole="button"
                        onPress={() => {
                          onChange(dateIso);
                          setIsOpen(false);
                        }}
                        style={({ pressed }) => [styles.day, isSelected ? styles.daySelected : null, isToday ? styles.dayToday : null, pressed ? styles.pressed : null]}
                      >
                        <Text style={isSelected ? styles.dayTextSelected : styles.dayText}>{date.getDate()}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
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
  helperText: {
    fontSize: 12,
    lineHeight: 17,
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
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
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
    marginBottom: spacing.xs,
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  daySelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayToday: {
    borderColor: colors.primary,
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
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
    columnGap: spacing.sm,
  },
  yearItem: {
    width: '31%',
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  yearText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
  yearTextSelected: {
    fontSize: 14,
    color: colors.background,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
});
