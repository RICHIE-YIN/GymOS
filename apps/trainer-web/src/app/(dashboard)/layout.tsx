'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clients',
  '/templates': 'Templates',
  '/messages': 'Messages',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  // Check for exact match
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Check for prefix match
  const prefix = Object.keys(PAGE_TITLES).find(
    (key) => key !== '/dashboard' && pathname.startsWith(key)
  );
  return prefix ? PAGE_TITLES[prefix] : 'GymOS';
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <Header
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
