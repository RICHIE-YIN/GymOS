'use client';

import React, { useState } from 'react';
import { useTemplates, useCreateTemplate, useDuplicateTemplate, useDeleteTemplate } from '@/hooks/usePrograms';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, formatGoal, formatSplitType, formatExperienceLevel, formatDate } from '@/lib/utils';
import { ProgramTemplate, GoalType, SplitType, ExperienceLevel } from '@/types';
import {
  Plus,
  Search,
  BookOpen,
  Users,
  Copy,
  Pencil,
  Trash2,
  MoreHorizontal,
  Dumbbell,
  Clock,
  Calendar,
} from 'lucide-react';

// Mock templates as fallback
const MOCK_TEMPLATES: ProgramTemplate[] = [
  {
    id: '1',
    name: '12-Week Strength Builder',
    description: 'Progressive overload program for intermediate lifters focusing on the big 3.',
    goal: 'strength',
    splitType: 'push_pull_legs',
    durationWeeks: 12,
    daysPerWeek: 5,
    experienceLevel: 'intermediate',
    trainerId: 'trainer1',
    useCount: 8,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
  },
  {
    id: '2',
    name: '8-Week Fat Loss Accelerator',
    description: 'High-intensity program combining strength and cardio for maximum fat burning.',
    goal: 'weight_loss',
    splitType: 'upper_lower',
    durationWeeks: 8,
    daysPerWeek: 4,
    experienceLevel: 'intermediate',
    trainerId: 'trainer1',
    useCount: 14,
    createdAt: '2023-11-05T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: '3',
    name: 'Beginner Foundation Program',
    description: 'Perfect entry point for new gym-goers. Full body workouts 3x per week.',
    goal: 'general_fitness',
    splitType: 'full_body',
    durationWeeks: 6,
    daysPerWeek: 3,
    experienceLevel: 'beginner',
    trainerId: 'trainer1',
    useCount: 22,
    createdAt: '2023-09-15T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Hypertrophy Bro Split',
    description: 'Classic muscle-building split targeting each muscle group once per week.',
    goal: 'muscle_gain',
    splitType: 'bro_split',
    durationWeeks: 8,
    daysPerWeek: 5,
    experienceLevel: 'intermediate',
    trainerId: 'trainer1',
    useCount: 11,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-28T00:00:00Z',
  },
  {
    id: '5',
    name: '16-Week Elite Performance',
    description: 'Advanced periodized program for competitive athletes.',
    goal: 'sport_performance',
    splitType: 'custom',
    durationWeeks: 16,
    daysPerWeek: 6,
    experienceLevel: 'advanced',
    trainerId: 'trainer1',
    useCount: 4,
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-03-05T00:00:00Z',
  },
  {
    id: '6',
    name: '4-Week Endurance Base',
    description: 'Build your aerobic foundation with this running and cross-training program.',
    goal: 'endurance',
    splitType: 'custom',
    durationWeeks: 4,
    daysPerWeek: 4,
    experienceLevel: 'beginner',
    trainerId: 'trainer1',
    useCount: 7,
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
  },
];

const GOAL_FILTER_OPTIONS = [
  { value: '', label: 'All Goals' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'strength', label: 'Strength' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'sport_performance', label: 'Sport Performance' },
];

const SPLIT_FILTER_OPTIONS = [
  { value: '', label: 'All Splits' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'upper_lower', label: 'Upper/Lower' },
  { value: 'push_pull_legs', label: 'Push/Pull/Legs' },
  { value: 'bro_split', label: 'Bro Split' },
  { value: 'custom', label: 'Custom' },
];

const LEVEL_FILTER_OPTIONS = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

function TemplateCard({ template, onDuplicate, onDelete }: {
  template: ProgramTemplate;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const goalColors: Record<string, string> = {
    weight_loss: 'from-red-500 to-orange-500',
    muscle_gain: 'from-blue-600 to-purple-600',
    strength: 'from-slate-700 to-slate-900',
    endurance: 'from-cyan-500 to-blue-500',
    general_fitness: 'from-green-500 to-teal-500',
    flexibility: 'from-pink-500 to-rose-500',
    sport_performance: 'from-amber-500 to-orange-600',
  };

  const gradient = goalColors[template.goal] || 'from-brand-600 to-brand-800';

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-card-hover transition-shadow group">
      {/* Gradient header */}
      <div className={cn('h-2 bg-gradient-to-r', gradient)} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-slate-900 truncate">{template.name}</h3>
            {template.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description}</p>
            )}
          </div>
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 z-20 py-1">
                  <button
                    onClick={() => { setMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-400" />
                    Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDuplicate(); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    Duplicate
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 w-full"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant="primary" size="sm">{formatGoal(template.goal)}</Badge>
          <Badge variant="default" size="sm">{formatSplitType(template.splitType)}</Badge>
          <Badge variant="default" size="sm">{formatExperienceLevel(template.experienceLevel)}</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {template.durationWeeks}w
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {template.daysPerWeek}d/wk
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            {template.useCount} uses
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            leftIcon={<Copy className="h-3.5 w-3.5" />}
            onClick={onDuplicate}
          >
            Duplicate
          </Button>
          <Button
            size="sm"
            fullWidth
            leftIcon={<Dumbbell className="h-3.5 w-3.5" />}
          >
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('');
  const [splitFilter, setSplitFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useTemplates({
    goal: goalFilter as GoalType || undefined,
    splitType: splitFilter as SplitType || undefined,
    experienceLevel: levelFilter as ExperienceLevel || undefined,
    search: search || undefined,
  });

  const duplicateTemplate = useDuplicateTemplate();
  const deleteTemplate = useDeleteTemplate();

  // Use mock data as fallback
  const templates = data?.data || MOCK_TEMPLATES.filter((t) => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchesGoal = !goalFilter || t.goal === goalFilter;
    const matchesSplit = !splitFilter || t.splitType === splitFilter;
    const matchesLevel = !levelFilter || t.experienceLevel === levelFilter;
    return matchesSearch && matchesGoal && matchesSplit && matchesLevel;
  });

  const totalUses = templates.reduce((sum, t) => sum + t.useCount, 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Templates</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {templates.length} templates · {totalUses} total assignments
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          <Select
            options={GOAL_FILTER_OPTIONS}
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            className="min-w-[130px]"
          />
          <Select
            options={SPLIT_FILTER_OPTIONS}
            value={splitFilter}
            onChange={(e) => setSplitFilter(e.target.value)}
            className="min-w-[130px]"
          />
          <Select
            options={LEVEL_FILTER_OPTIONS}
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="min-w-[120px]"
          />
        </div>
      </div>

      {/* Template grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 h-52 animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title={search || goalFilter || splitFilter || levelFilter ? 'No templates found' : 'No templates yet'}
          description={
            search ? `No templates match "${search}".` : 'Create your first workout program template.'
          }
          action={{ label: 'Create Template', onClick: () => {} }}
          secondaryAction={
            (search || goalFilter) ? { label: 'Clear filters', onClick: () => { setSearch(''); setGoalFilter(''); setSplitFilter(''); setLevelFilter(''); } }
            : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDuplicate={() => duplicateTemplate.mutate(template.id)}
              onDelete={() => setDeleteId(template.id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Template"
        size="sm"
      >
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete this template? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleteTemplate.isPending}
            onClick={() => {
              if (deleteId) {
                deleteTemplate.mutate(deleteId, {
                  onSuccess: () => setDeleteId(null),
                });
              }
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
