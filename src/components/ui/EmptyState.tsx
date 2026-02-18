import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Inbox, Search, AlertCircle, Construction, FileQuestion } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// =============================================
// EMPTY STATE COMPONENT
// =============================================

export type EmptyStateVariant = 'no-data' | 'no-results' | 'error' | 'coming-soon' | 'custom';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultIcons: Record<Exclude<EmptyStateVariant, 'custom'>, React.ReactNode> = {
  'no-data':     <Inbox size={40} strokeWidth={1.5} />,
  'no-results':  <Search size={40} strokeWidth={1.5} />,
  'error':       <AlertCircle size={40} strokeWidth={1.5} />,
  'coming-soon': <Construction size={40} strokeWidth={1.5} />,
};

const variantColors: Record<Exclude<EmptyStateVariant, 'custom'>, string> = {
  'no-data':     'text-surface-300 bg-surface-100',
  'no-results':  'text-brand-300 bg-brand-50',
  'error':       'text-danger bg-red-50',
  'coming-soon': 'text-warm-400 bg-warm-50',
};

export function EmptyState({
  variant = 'no-data',
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const displayIcon = icon || (variant !== 'custom' ? defaultIcons[variant] : <FileQuestion size={40} strokeWidth={1.5} />);
  const iconColor = variant !== 'custom' ? variantColors[variant] : 'text-surface-300 bg-surface-100';

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-4', iconColor)}>
        {displayIcon}
      </div>
      <h3 className="text-base font-semibold text-surface-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-surface-400 max-w-sm">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-5">
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 text-sm font-medium text-surface-600 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-sm"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
