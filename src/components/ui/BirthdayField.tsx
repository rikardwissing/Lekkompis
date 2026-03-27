import { CalendarDateField } from '@/components/ui/CalendarDateField';

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
      helperText="Use the calendar for accurate age matching."
      label={label}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
    />
  );
}
