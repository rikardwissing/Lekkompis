import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

type PickerMode = 'days' | 'months' | 'years';

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
    const intlWithLocale = Intl as typeof Intl & { Locale?: new (value: string) => { weekInfo?: { firstDay?: number } } };

    if (!intlWithLocale.Locale) {
      return 0;
    }

    const localeInfo = new intlWithLocale.Locale(locale) as { weekInfo?: { firstDay?: number } };
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
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
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

const getModeLabel = (mode: PickerMode, monthCursor: Date) => {
  if (mode === 'days') {
    return `${MONTHS[monthCursor.getMonth()]} ${monthCursor.getFullYear()}`;
  }

  if (mode === 'months') {
    return String(monthCursor.getFullYear());
  }

  const years = getYearRange(monthCursor.getFullYear());
  return `${years[0]}-${years[years.length - 1]}`;
};

const getNextMode = (mode: PickerMode): PickerMode => {
  if (mode === 'days') {
    return 'months';
  }

  if (mode === 'months') {
    return 'years';
  }

  return 'days';
};

const moveCursor = (current: Date, mode: PickerMode, direction: -1 | 1) => {
  if (mode === 'days') {
    return new Date(current.getFullYear(), current.getMonth() + direction, 1);
  }

  if (mode === 'months') {
    return new Date(current.getFullYear() + direction, current.getMonth(), 1);
  }

  return new Date(current.getFullYear() + direction * 12, current.getMonth(), 1);
};

export function CalendarDateField({ label, placeholder = 'Pick a date', helperText, firstDayOfWeek, value, onChange }: CalendarDateFieldProps) {
  const normalizedFirstDay = useMemo(() => normalizeFirstDayOfWeek(firstDayOfWeek), [firstDayOfWeek]);
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const todayIso = useMemo(() => toIsoDate(new Date()), []);
  const weekdayLabels = useMemo(() => getWeekdayLabels(normalizedFirstDay), [normalizedFirstDay]);

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PickerMode>('days');
  const [monthCursor, setMonthCursor] = useState<Date>(() => selectedDate ?? new Date());
  const [pageWidth, setPageWidth] = useState(320);
  const [contentHeights, setContentHeights] = useState<Record<PickerMode, number>>({ days: 320, months: 220, years: 220 });

  const scrollRef = useRef<ScrollView | null>(null);
  const modeAnim = useRef(new Animated.Value(1)).current;
  const contentHeight = useRef(new Animated.Value(contentHeights.days)).current;
  const isAdjustingRef = useRef(false);

  useEffect(() => {
    modeAnim.setValue(0);
    Animated.spring(modeAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [mode, modeAnim]);

  useEffect(() => {
    Animated.timing(contentHeight, {
      toValue: contentHeights[mode],
      duration: 220,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [contentHeight, contentHeights, mode]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ x: pageWidth, animated: false });
      });
    }
  }, [isOpen, pageWidth, monthCursor, mode]);

  const measureContentHeight = (targetMode: PickerMode, measuredHeight: number) => {
    const roundedHeight = Math.ceil(measuredHeight);

    setContentHeights((current) => {
      if (Math.abs(current[targetMode] - roundedHeight) < 2) {
        return current;
      }

      return {
        ...current,
        [targetMode]: roundedHeight,
      };
    });
  };

  const openPicker = () => {
    setMonthCursor(selectedDate ?? new Date());
    setMode('days');
    setIsOpen(true);
  };

  const pageByDirection = (direction: -1 | 1) => {
    if (isAdjustingRef.current) {
      return;
    }

    scrollRef.current?.scrollTo({ x: direction === -1 ? 0 : pageWidth * 2, animated: true });
  };

  const onMomentumEnd = (xOffset: number) => {
    if (isAdjustingRef.current || pageWidth <= 0) {
      return;
    }

    const page = Math.round(xOffset / pageWidth);
    if (page === 1) {
      return;
    }

    const direction = page < 1 ? -1 : 1;
    isAdjustingRef.current = true;

    setMonthCursor((current) => moveCursor(current, mode, direction));

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: pageWidth, animated: false });
      isAdjustingRef.current = false;
    });
  };

  const renderModePanel = (cursor: Date, slot: 'prev' | 'current' | 'next') => {
    const monthDays = getMonthDays(cursor, normalizedFirstDay);
    const yearRange = getYearRange(cursor.getFullYear());
    const shouldMeasure = slot === 'current';

    if (mode === 'days') {
      return (
        <View
          onLayout={shouldMeasure ? (event) => measureContentHeight('days', event.nativeEvent.layout.height) : undefined}
          style={styles.panelInner}
        >
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
                return <View key={`empty-${slot}-${index}`} style={styles.emptyDay} />;
              }

              const dateIso = toIsoDate(date);
              const isSelected = dateIso === value;
              const isToday = dateIso === todayIso;

              return (
                <Pressable
                  key={`${slot}-${dateIso}`}
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(dateIso);
                    setIsOpen(false);
                  }}
                  style={({ pressed }) => [styles.day, pressed ? styles.pressed : null]}
                >
                  <View style={[styles.dayInner, isSelected ? styles.dayInnerSelected : null, isToday ? styles.dayInnerToday : null]}>
                    <Text style={isSelected ? styles.dayTextSelected : styles.dayText}>{date.getDate()}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    }

    if (mode === 'months') {
      return (
        <View
          onLayout={shouldMeasure ? (event) => measureContentHeight('months', event.nativeEvent.layout.height) : undefined}
          style={styles.selectionGrid}
        >
          {MONTHS.map((monthLabel, index) => {
            const isSelected = cursor.getMonth() === index;

            return (
              <Pressable
                key={`${slot}-${monthLabel}`}
                accessibilityRole="button"
                onPress={() => {
                  setMonthCursor((current) => new Date(current.getFullYear(), index, 1));
                  setMode('days');
                }}
                style={({ pressed }) => [styles.selectionItem, isSelected ? styles.selectionItemSelected : null, pressed ? styles.pressed : null]}
              >
                <Text style={isSelected ? styles.selectionTextSelected : styles.selectionText}>{monthLabel}</Text>
              </Pressable>
            );
          })}
        </View>
      );
    }

    return (
      <View
        onLayout={shouldMeasure ? (event) => measureContentHeight('years', event.nativeEvent.layout.height) : undefined}
        style={styles.selectionGrid}
      >
        {yearRange.map((year) => {
          const isSelected = year === cursor.getFullYear();

          return (
            <Pressable
              key={`${slot}-${year}`}
              accessibilityRole="button"
              onPress={() => {
                setMonthCursor((current) => new Date(year, current.getMonth(), 1));
                setMode('days');
              }}
              style={({ pressed }) => [styles.selectionItem, isSelected ? styles.selectionItemSelected : null, pressed ? styles.pressed : null]}
            >
              <Text style={isSelected ? styles.selectionTextSelected : styles.selectionText}>{year}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const prevCursor = moveCursor(monthCursor, mode, -1);
  const nextCursor = moveCursor(monthCursor, mode, 1);

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
              <Pressable accessibilityRole="button" onPress={() => pageByDirection(-1)} style={styles.navButton}>
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setMode((current) => getNextMode(current))} style={styles.headerCenter}>
                <Text style={styles.monthLabel}>{getModeLabel(mode, monthCursor)}</Text>
                <Text style={styles.modeHint}>{mode === 'days' ? 'Swipe for months' : mode === 'months' ? 'Swipe for years' : 'Swipe for year ranges'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => pageByDirection(1)} style={styles.navButton}>
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>
            </View>

            <Animated.View style={[styles.heightShell, { height: contentHeight }]}> 
              <Animated.View
                style={[
                  styles.contentShell,
                  {
                    opacity: modeAnim,
                    transform: [
                      {
                        scale: modeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.96, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.viewport} onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    ref={scrollRef}
                    scrollEventThrottle={16}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => onMomentumEnd(event.nativeEvent.contentOffset.x)}
                  >
                    <View style={[styles.page, { width: pageWidth }]}>{renderModePanel(prevCursor, 'prev')}</View>
                    <View style={[styles.page, { width: pageWidth }]}>{renderModePanel(monthCursor, 'current')}</View>
                    <View style={[styles.page, { width: pageWidth }]}>{renderModePanel(nextCursor, 'next')}</View>
                  </ScrollView>
                </View>
              </Animated.View>
            </Animated.View>
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
    paddingHorizontal: spacing.sm,
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
    gap: spacing.sm,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modeHint: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  heightShell: {
    overflow: 'hidden',
  },
  contentShell: {
    gap: spacing.xs,
  },
  viewport: {
    overflow: 'hidden',
  },
  page: {
    paddingHorizontal: 0,
  },
  panelInner: {
    gap: spacing.xs,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  dayInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayInnerSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayInnerToday: {
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    includeFontPadding: false,
    textAlign: 'center',
    color: colors.text,
    fontWeight: '600',
  },
  dayTextSelected: {
    fontSize: 14,
    includeFontPadding: false,
    textAlign: 'center',
    color: colors.background,
    fontWeight: '700',
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
    columnGap: spacing.sm,
  },
  selectionItem: {
    width: '31%',
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
  selectionTextSelected: {
    fontSize: 14,
    color: colors.background,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
});
