import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { CampaignStatus } from '@/types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

const variants = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
};

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

const statusConfig: Record<CampaignStatus, { label: string; variant: BadgeProps['variant']; dot: string }> = {
  DRAFT: { label: 'Draft', variant: 'default', dot: 'bg-slate-400' },
  ACTIVE: { label: 'Active', variant: 'success', dot: 'bg-emerald-500' },
  PAUSED: { label: 'Paused', variant: 'warning', dot: 'bg-amber-400' },
  COMPLETED: { label: 'Completed', variant: 'info', dot: 'bg-blue-500' },
  FAILED: { label: 'Failed', variant: 'danger', dot: 'bg-red-500' },
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot, status === 'ACTIVE' && 'animate-pulse')} />
      {config.label}
    </Badge>
  );
}
