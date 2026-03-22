'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageCircle,
  BarChart3,
  Settings,
  Dumbbell,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Clients',
    href: '/clients',
    icon: Users,
  },
  {
    label: 'Templates',
    href: '/templates',
    icon: BookOpen,
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: MessageCircle,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { trainer, logout } = useAuthStore();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600">
          <Dumbbell className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-lg leading-none">GymOS</span>
          <p className="text-slate-400 text-xs mt-0.5">Trainer Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                active
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              <span>{item.label}</span>
              {active && <ChevronRight className="h-4 w-4 ml-auto text-blue-300" />}
            </Link>
          );
        })}
      </nav>

      {/* Trainer profile at bottom */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
          {trainer?.avatarUrl ? (
            <img
              src={trainer.avatarUrl}
              alt={trainer.name}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
                trainer ? getAvatarColor(trainer.name) : 'bg-brand-600'
              )}
            >
              {trainer ? getInitials(trainer.name) : 'T'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {trainer?.name || 'Trainer'}
            </p>
            <p className="text-xs text-slate-400 truncate">{trainer?.email || ''}</p>
          </div>
          <button
            onClick={() => logout()}
            className="p-1 rounded text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-slate-900 shadow-sidebar fixed left-0 top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Sidebar panel */}
          <aside className="relative flex flex-col w-64 h-full bg-slate-900 shadow-xl animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;
