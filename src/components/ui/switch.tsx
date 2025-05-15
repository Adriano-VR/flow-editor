import * as React from 'react';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={e => onCheckedChange(e.target.checked)}
          disabled={disabled}
          ref={ref}
          {...props}
        />
        <div
          className={
            `w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 ` +
            `rounded-full peer peer-checked:bg-primary-500 transition-colors duration-200` +
            (disabled ? ' opacity-50 cursor-not-allowed' : '')
          }
        >
          <div
            className={
              `absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 rounded-full shadow ` +
              `transition-transform duration-200` +
              (checked ? ' translate-x-4' : '')
            }
          />
        </div>
      </label>
    );
  }
);

Switch.displayName = 'Switch'; 