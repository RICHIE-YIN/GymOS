import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, fmt = 'MMM d, yyyy'): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return 'Invalid date';
    return format(date, fmt);
  } catch {
    return 'Invalid date';
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return 'Unknown';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

export function formatWeight(value: number, unit: 'kg' | 'lbs'): string {
  return `${value.toFixed(1)} ${unit}`;
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatGoal(goal: string): string {
  const labels: Record<string, string> = {
    weight_loss: 'Weight Loss',
    muscle_gain: 'Muscle Gain',
    strength: 'Strength',
    endurance: 'Endurance',
    general_fitness: 'General Fitness',
    flexibility: 'Flexibility',
    sport_performance: 'Sport Performance',
  };
  return labels[goal] || goal;
}

export function formatSplitType(split: string): string {
  const labels: Record<string, string> = {
    full_body: 'Full Body',
    upper_lower: 'Upper/Lower',
    push_pull_legs: 'Push/Pull/Legs',
    bro_split: 'Bro Split',
    custom: 'Custom',
  };
  return labels[split] || split;
}

export function formatExperienceLevel(level: string): string {
  const labels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  return labels[level] || level;
}

export function getComplianceColor(rate: number): string {
  if (rate >= 80) return 'text-success-600';
  if (rate >= 60) return 'text-warning-600';
  return 'text-danger-600';
}

export function getComplianceBadgeVariant(rate: number): 'success' | 'warning' | 'danger' {
  if (rate >= 80) return 'success';
  if (rate >= 60) return 'warning';
  return 'danger';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || `${singular}s`}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generate avatar initials and colors
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-indigo-500',
];

export function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
