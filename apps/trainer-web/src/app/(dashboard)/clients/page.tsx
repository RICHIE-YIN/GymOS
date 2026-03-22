'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useClients } from '@/hooks/useClients';
import { ClientCard } from '@/components/clients/ClientCard';
import { InviteClientModal } from '@/components/clients/InviteClientModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonRow } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { Client, ClientStatus } from '@/types';
import {
  UserPlus,
  Search,
  LayoutGrid,
  List,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type FilterTab = 'all' | ClientStatus;

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All Clients' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'needs_attention', label: 'Needs Attention' },
];

// Mock client data as fallback
const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@example.com', goal: 'weight_loss', experienceLevel: 'intermediate', status: 'active', trainerId: 'trainer1', metrics: { currentWeight: 68, startingWeight: 75, targetWeight: 62, weightUnit: 'kg', heightUnit: 'cm' }, complianceRate: 91, lastActiveAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), joinedAt: '2024-01-15T00:00:00Z', checkInsDue: 0, weightTrend: 'down', weightTrendValue: -1.8 },
  { id: '2', name: 'Marcus Lee', email: 'marcus@example.com', goal: 'muscle_gain', experienceLevel: 'beginner', status: 'active', trainerId: 'trainer1', metrics: { currentWeight: 78, startingWeight: 74, targetWeight: 85, weightUnit: 'kg', heightUnit: 'cm' }, complianceRate: 76, lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), joinedAt: '2024-02-01T00:00:00Z', checkInsDue: 1, weightTrend: 'up', weightTrendValue: 1.2 },
  { id: '3', name: 'Jordan Kim', email: 'jordan@example.com', goal: 'strength', experienceLevel: 'intermediate', status: 'active', trainerId: 'trainer1', metrics: { currentWeight: 82, startingWeight: 80, targetWeight: 90, weightUnit: 'kg', heightUnit: 'cm' }, complianceRate: 88, lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), joinedAt: '2023-11-20T00:00:00Z', checkInsDue: 0, weightTrend: 'stable' },
  { id: '4', name: 'Alex Torres', email: 'alex@example.com', goal: 'general_fitness', experienceLevel: 'beginner', status: 'needs_attention', trainerId: 'trainer1', metrics: { currentWeight: 95, startingWeight: 98, targetWeight: 85, weightUnit: 'kg', heightUnit: 'cm' }, complianceRate: 42, lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(), joinedAt: '2024-01-08T00:00:00Z', checkInsDue: 2, weightTrend: 'stable' },
  { id: '5', name: 'Emma Davis', email: 'emma@example.com', goal: 'weight_loss', experienceLevel: 'advanced', status: 'active', trainerId: 'trainer1', metrics: { currentWeight: 63, startingWeight: 70, targetWeight: 58, weightUnit: 'kg', heightUnit: 'cm' }, complianceRate: 95, lastActiveAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), joinedAt: '2023-09-01T00:00:00Z', checkInsDue: 1, weightTrend: 'down', weightTrendValue: -2.1 },
  { id: '6', name: 'Mike Johnson', email: 'mike@example.com', goal: 'muscle_gain', experienceLevel: 'intermediate', status: 'needs_attention', trainerId: 'trainer1', metrics: { currentWeight: 85, startingWeight: 82, targetWeight: 92, weightUnit: 'kg', heightUnit: 'cm' }, complianceRate: 55, lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), joinedAt: '2024-01-20T00:00:00Z', checkInsDue: 3, weightTrend: 'stable' },
];

export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>(
    (searchParams.get('filter') as FilterTab) || 'all'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const { data, isLoading, isError } = useClients({
    status: activeTab === 'all' ? undefined : activeTab,
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  // Use mock data as fallback
  const clients = data?.data || MOCK_CLIENTS;
  const totalClients = data?.total || MOCK_CLIENTS.length;
  const totalPages = data?.totalPages || 1;

  const filteredMockClients = MOCK_CLIENTS.filter((c) => {
    const matchesTab = activeTab === 'all' || c.status === activeTab;
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const displayClients = data ? clients : filteredMockClients;

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clients</h2>
          <p className="text-sm text-slate-500 mt-0.5">{totalClients} total clients</p>
        </div>
        <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setInviteOpen(true)}>
          Invite Client
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search clients by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="sm:max-w-xs"
        />

        {/* Tab filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setPage(1);
              }}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View mode */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg ml-auto">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        viewMode === 'list' ? (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 px-4">
            {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse h-48" />
            ))}
          </div>
        )
      ) : isError ? (
        // Show mock data on error (API not connected)
        viewMode === 'list' ? (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 px-4">
            {/* List header */}
            <div className="grid grid-cols-12 gap-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">Client</div>
              <div className="col-span-2 hidden sm:block">Last Active</div>
              <div className="col-span-2 hidden md:block">Compliance</div>
              <div className="col-span-2 hidden lg:block">Weight Trend</div>
              <div className="col-span-2 hidden lg:block">Status</div>
            </div>
            {filteredMockClients.map((client) => (
              <ClientCard key={client.id} client={client} view="row" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMockClients.map((client) => (
              <ClientCard key={client.id} client={client} view="card" />
            ))}
          </div>
        )
      ) : displayClients.length === 0 ? (
        <EmptyState
          icon={<UserPlus className="h-8 w-8" />}
          title={search ? 'No clients found' : 'No clients yet'}
          description={
            search
              ? `No clients match "${search}". Try a different search.`
              : 'Invite your first client to get started!'
          }
          action={{
            label: 'Invite Client',
            onClick: () => setInviteOpen(true),
          }}
          secondaryAction={
            search
              ? { label: 'Clear search', onClick: () => setSearch('') }
              : undefined
          }
        />
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* List header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
            <div className="col-span-4">Client</div>
            <div className="col-span-2 hidden sm:block">Last Active</div>
            <div className="col-span-2 hidden md:block">Compliance</div>
            <div className="col-span-2 hidden lg:block">Weight</div>
            <div className="col-span-2 hidden lg:block">Status</div>
          </div>
          <div className="divide-y divide-slate-50">
            {displayClients.map((client) => (
              <ClientCard key={client.id} client={client} view="row" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayClients.map((client) => (
            <ClientCard key={client.id} client={client} view="card" />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalClients)} of {totalClients} clients
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <InviteClientModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
