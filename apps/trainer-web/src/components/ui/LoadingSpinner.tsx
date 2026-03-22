import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-brand-600', sizeClasses[size])} />
      {text && <span className="text-sm text-slate-500">{text}</span>}
    </div>
  );
}

export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center h-64 w-full">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm text-slate-500 font-medium">{text}</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse">
      <div className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1">
        <div className="h-3.5 bg-slate-200 rounded w-40 mb-1.5" />
        <div className="h-3 bg-slate-200 rounded w-28" />
      </div>
      <div className="h-3 bg-slate-200 rounded w-20" />
      <div className="h-6 bg-slate-200 rounded-full w-16" />
    </div>
  );
}

export default LoadingSpinner;
