import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { dateOnlyToDate, formatDateOnly, isValidDateOnly, toDateOnlyString } from '@/utils/birthdays';

type BirthdayFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

const NativeDateTimePicker =
  Platform.OS === 'web' ? null : (require('@react-native-community/datetimepicker').default as ComponentType<any>);

const digitsOnly = (value: string, maxLength: number) =>
  value.replace(/[^0-9]/g, '').slice(0, maxLength);

export function BirthdayField({
  label,
  placeholder = 'Add birthday',
  value,
  onChange,
}: BirthdayFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [webDay, setWebDay] = useState('');
  const [webMonth, setWebMonth] = useState('');
  const [webYear, setWebYear] = useState('');

  useEffect(() => {
    if (!isValidDateOnly(value)) {
      setWebDay('');
      setWebMonth('');
      setWebYear('');
      return;
    }

    const [year, month, day] = value.split('-');
    setWebDay(day);
    setWebMonth(month);
    setWebYear(year);
  }, [value]);

  const pickerValue = useMemo(() => dateOnlyToDate(value) ?? new Date(2021, 0, 1), [value]);

  const commitWebValue = (nextDay: string, nextMonth: string, nextYear: string) => {
    if (nextDay.length === 0 && nextMonth.length === 0 && nextYear.length === 0) {
      onChange('');
      return;
    }

    if (nextDay.length === 2 && nextMonth.length === 2 && nextYear.length === 4) {
      const nextValue = `${nextYear}-${nextMonth}-${nextDay}`;
      onChange(isValidDateOnly(nextValue) ? nextValue : '');
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.webRow}>
          <TextInput
            keyboardType="number-pad"
            maxLength={2}
            onChangeText={(nextValue) => {
              const parsed = digitsOnly(nextValue, 2);
              setWebDay(parsed);
              commitWebValue(parsed, webMonth, webYear);
            }}
            placeholder="DD"
            placeholderTextColor={colors.textMuted}
            style={[styles.webInput, styles.webInputSmall]}
            value={webDay}
          />
          <TextInput
            keyboardType="number-pad"
            maxLength={2}
            onChangeText={(nextValue) => {
              const parsed = digitsOnly(nextValue, 2);
              setWebMonth(parsed);
              commitWebValue(webDay, parsed, webYear);
            }}
            placeholder="MM"
            placeholderTextColor={colors.textMuted}
            style={[styles.webInput, styles.webInputSmall]}
            value={webMonth}
          />
          <TextInput
            keyboardType="number-pad"
            maxLength={4}
            onChangeText={(nextValue) => {
              const parsed = digitsOnly(nextValue, 4);
              setWebYear(parsed);
              commitWebValue(webDay, webMonth, parsed);
            }}
            placeholder="YYYY"
            placeholderTextColor={colors.textMuted}
            style={[styles.webInput, styles.webInputLarge]}
            value={webYear}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen((current) => !current)}
        style={({ pressed }) => [
          styles.nativeTrigger,
          pressed ? styles.pressed : null,
        ]}
      >
        <Text style={value ? styles.nativeValue : styles.nativePlaceholder}>
          {value ? formatDateOnly(value) : placeholder}
        </Text>
        <Text style={styles.nativeAction}>{isOpen ? 'Hide' : 'Pick'}</Text>
      </Pressable>
      {isOpen && NativeDateTimePicker ? (
        <View style={styles.nativePickerShell}>
          <NativeDateTimePicker
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            mode="date"
            onChange={(event: { type?: string }, selectedDate?: Date) => {
              if (Platform.OS === 'android') {
                setIsOpen(false);
              }

              if (event?.type === 'dismissed' || !selectedDate) {
                return;
              }

              onChange(toDateOnlyString(selectedDate));
            }}
            value={pickerValue}
          />
        </View>
      ) : null}
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
  nativeTrigger: {
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
  nativeValue: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  nativePlaceholder: {
    flex: 1,
    fontSize: 16,
    color: colors.textMuted,
  },
  nativeAction: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  nativePickerShell: {
    alignSelf: 'stretch',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
  },
  webRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  webInput: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  webInputSmall: {
    flex: 1,
  },
  webInputLarge: {
    flex: 1.4,
  },
  pressed: {
    opacity: 0.85,
  },
});
