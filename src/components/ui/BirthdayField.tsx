import { CalendarDateField } from '@/components/ui/CalendarDateField';
import { formatDateOnly, isValidDateOnly } from '@/utils/birthdays';

type BirthdayFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export function BirthdayField({
  label,
  placeholder = 'Add birthday',
  value,
  onChange,
}: BirthdayFieldProps) {
  return (
    <CalendarDateField
      formatValue={(nextValue) => (isValidDateOnly(nextValue) ? formatDateOnly(nextValue) : '')}
      label={label}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
    />
  );
}
