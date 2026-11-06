'use client';

interface Props {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  small?: boolean;
}

export function QuantityStepper({ value, onChange, label, min = 1, max = 20, small = false }: Props) {
  return (
    <div className={`stepper${small ? ' stepper-small' : ''}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
