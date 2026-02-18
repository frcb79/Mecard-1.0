import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// =============================================
// INPUT COMPONENT
// =============================================

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const inputSizes = {
  sm: 'h-8 text-sm px-3 rounded-md',
  md: 'h-10 text-sm px-3.5 rounded-lg',
  lg: 'h-12 text-base px-4 rounded-xl',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, size = 'md', className, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-surface-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full border bg-white text-surface-800 placeholder:text-surface-400',
              'transition-all duration-200 outline-none',
              'focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
              'disabled:bg-surface-50 disabled:text-surface-400 disabled:cursor-not-allowed',
              error ? 'border-danger ring-2 ring-danger/10' : 'border-surface-200',
              icon ? 'pl-10' : '',
              inputSizes[size],
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-danger font-medium" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="mt-1 text-xs text-surface-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// =============================================
// TEXTAREA COMPONENT
// =============================================

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-surface-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full border bg-white text-surface-800 placeholder:text-surface-400 rounded-lg',
            'transition-all duration-200 outline-none px-3.5 py-2.5 text-sm',
            'focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
            'disabled:bg-surface-50 disabled:text-surface-400 disabled:cursor-not-allowed',
            'resize-y min-h-[80px]',
            error ? 'border-danger ring-2 ring-danger/10' : 'border-surface-200',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1 text-xs text-danger font-medium" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${textareaId}-hint`} className="mt-1 text-xs text-surface-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// =============================================
// SELECT COMPONENT
// =============================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
}

const selectSizes = {
  sm: 'h-8 text-sm px-3 rounded-md',
  md: 'h-10 text-sm px-3.5 rounded-lg',
  lg: 'h-12 text-base px-4 rounded-xl',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, size = 'md', className, id, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-surface-700 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full border bg-white text-surface-800 appearance-none',
            'transition-all duration-200 outline-none',
            'focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
            'disabled:bg-surface-50 disabled:text-surface-400 disabled:cursor-not-allowed',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center]',
            error ? 'border-danger ring-2 ring-danger/10' : 'border-surface-200',
            selectSizes[size],
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs text-danger font-medium" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="mt-1 text-xs text-surface-400">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// =============================================
// TOGGLE / SWITCH COMPONENT
// =============================================

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const toggleSizes = {
  sm: { track: 'w-8 h-[18px]', thumb: 'w-3.5 h-3.5', translate: 'translate-x-[14px]' },
  md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
};

export function Toggle({ checked, onChange, label, description, disabled = false, size = 'md', className }: ToggleProps) {
  const sizes = toggleSizes[size];
  const toggleId = label ? `toggle-${label.toLowerCase().replace(/\s/g, '-')}` : undefined;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        id={toggleId}
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200',
          sizes.track,
          checked ? 'bg-brand-500' : 'bg-surface-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200',
            sizes.thumb,
            'translate-y-[1px]',
            checked ? sizes.translate : 'translate-x-0.5'
          )}
        />
      </button>
      {(label || description) && (
        <div>
          {label && <span className="text-sm font-medium text-surface-700">{label}</span>}
          {description && <p className="text-xs text-surface-400 mt-0.5">{description}</p>}
        </div>
      )}
    </div>
  );
}
