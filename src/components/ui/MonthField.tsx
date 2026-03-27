import { CalendarDateField } from '@/components/ui/CalendarDateField';
import { formatMonthOnly, isValidMonthOnly } from '@/utils/birthdays';

type MonthFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export function MonthField({ label, placeholder = 'Add due month', value, onChange }: MonthFieldProps) {
  return (
    <CalendarDateField
      formatValue={(nextValue) => (isValidMonthOnly(nextValue) ? formatMonthOnly(nextValue) : '')}
      label={label}
      mode="month"
      onChange={onChange}
      placeholder={placeholder}
      value={value}
    />
  );
}
