import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// =============================================
// CARD COMPONENT
// =============================================

export type CardVariant = 'default' | 'glass' | 'dark' | 'gradient' | 'outlined' | 'elevated';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
  hover?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default:  'bg-white border border-surface-200/60 shadow-card',
  glass:    'glass shadow-card',
  dark:     'bg-surface-900 border border-surface-700/40 text-white',
  gradient: 'bg-gradient-to-br from-brand-500 to-brand-700 text-white border-0 shadow-lg',
  outlined: 'bg-transparent border-2 border-surface-200',
  elevated: 'bg-white shadow-xl border border-surface-100',
};

const sizeStyles: Record<CardSize, string> = {
  sm: 'p-3 rounded-lg',
  md: 'p-5 rounded-xl',
  lg: 'p-6 rounded-2xl',
  xl: 'p-8 rounded-3xl',
};

export function Card({
  variant = 'default',
  size = 'md',
  hover = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        variantStyles[variant],
        sizeStyles[size],
        hover && 'transition-all duration-300 ease-bounce-in hover:shadow-card-hover hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// =============================================
// CARD SUB-COMPONENTS
// =============================================

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function CardTitle({ as: Tag = 'h3', className, children, ...props }: CardTitleProps) {
  return (
    <Tag className={cn('font-bold text-lg tracking-tight', className)} {...props}>
      {children}
    </Tag>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-surface-500 mt-1', className)} {...props}>
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-surface-100 flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  );
}

// =============================================
// STAT CARD (Common pattern across dashboards)
// =============================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; label?: string };
  variant?: 'default' | 'brand' | 'trust' | 'warm' | 'danger';
  className?: string;
}

const statVariantStyles: Record<string, { bg: string; icon: string; trend: string }> = {
  default: { bg: 'bg-surface-50', icon: 'bg-surface-100 text-surface-600', trend: 'text-surface-500' },
  brand:   { bg: 'bg-brand-50', icon: 'bg-brand-100 text-brand-600', trend: 'text-brand-600' },
  trust:   { bg: 'bg-trust-50', icon: 'bg-trust-100 text-trust-600', trend: 'text-trust-600' },
  warm:    { bg: 'bg-warm-50', icon: 'bg-warm-100 text-warm-600', trend: 'text-warm-600' },
  danger:  { bg: 'bg-red-50', icon: 'bg-red-100 text-red-600', trend: 'text-red-600' },
};

export function StatCard({ label, value, icon, trend, variant = 'default', className }: StatCardProps) {
  const styles = statVariantStyles[variant];
  
  return (
    <Card size="md" hover className={cn(styles.bg, className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500">{label}</p>
          <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
          {trend && (
            <p className={cn('text-xs font-medium mt-2 flex items-center gap-1', 
              trend.value >= 0 ? 'text-trust-600' : 'text-danger')}>
              <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              {trend.label && <span className="text-surface-400">{trend.label}</span>}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', styles.icon)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
