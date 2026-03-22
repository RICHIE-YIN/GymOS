'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import {
  Menu,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  User,
} from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { trainer, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Mock notifications - in production these would come from a hook
  const notifications = [
    {
      id: '1',
      text: 'Marcus Lee submitted a check-in',
      time: '5 min ago',
      unread: true,
    },
    {
      id: '2',
      text: 'Sarah Chen completed Week 3 Day 2',
      time: '12 min ago',
      unread: true,
    },
    {
      id: '3',
      text: 'Jordan Kim sent you a message',
      time: '1 hour ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 z-20 sticky top-0">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
            }}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500" />
            )}
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-20 animate-fade-in">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors',
                        n.unread && 'bg-brand-50/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {n.unread && (
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-600 shrink-0" />
                        )}
                        <div className={cn(!n.unread && 'ml-5')}>
                          <p className="text-sm text-slate-700">{n.text}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-100 text-center">
                  <button className="text-sm text-brand-600 font-medium hover:text-brand-700">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Trainer avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {trainer?.avatarUrl ? (
              <img
                src={trainer.avatarUrl}
                alt={trainer.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
                  trainer ? getAvatarColor(trainer.name) : 'bg-brand-600'
                )}
              >
                {trainer ? getInitials(trainer.name) : 'T'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-700 leading-none">
                {trainer?.name || 'Trainer'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 capitalize">
                {trainer?.role || 'trainer'}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-20 py-1 animate-fade-in">
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Settings
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
