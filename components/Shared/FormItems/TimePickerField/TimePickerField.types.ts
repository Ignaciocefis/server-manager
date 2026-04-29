export interface TimePickerFieldProps {
  name: string;
  label: string;
  selectedHour: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}