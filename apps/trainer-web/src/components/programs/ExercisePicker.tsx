'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Exercise } from '@/types';
import { Search, Plus, Dumbbell } from 'lucide-react';

// Mock exercise database - in production this would come from the API
const EXERCISES: Exercise[] = [
  { id: '1', name: 'Barbell Squat', muscleGroups: ['quads', 'glutes', 'hamstrings'], equipment: ['barbell', 'rack'], category: 'strength' },
  { id: '2', name: 'Romanian Deadlift', muscleGroups: ['hamstrings', 'glutes', 'lower back'], equipment: ['barbell'], category: 'strength' },
  { id: '3', name: 'Bench Press', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: ['barbell', 'bench'], category: 'strength' },
  { id: '4', name: 'Pull-Up', muscleGroups: ['lats', 'biceps', 'rear delts'], equipment: ['pull-up bar'], category: 'strength' },
  { id: '5', name: 'Overhead Press', muscleGroups: ['shoulders', 'triceps'], equipment: ['barbell'], category: 'strength' },
  { id: '6', name: 'Dumbbell Row', muscleGroups: ['lats', 'rhomboids', 'biceps'], equipment: ['dumbbell', 'bench'], category: 'strength' },
  { id: '7', name: 'Leg Press', muscleGroups: ['quads', 'glutes'], equipment: ['leg press machine'], category: 'strength' },
  { id: '8', name: 'Incline Dumbbell Press', muscleGroups: ['upper chest', 'shoulders'], equipment: ['dumbbell', 'bench'], category: 'strength' },
  { id: '9', name: 'Cable Fly', muscleGroups: ['chest'], equipment: ['cable machine'], category: 'strength' },
  { id: '10', name: 'Face Pull', muscleGroups: ['rear delts', 'rotator cuff'], equipment: ['cable machine'], category: 'strength' },
  { id: '11', name: 'Lat Pulldown', muscleGroups: ['lats', 'biceps'], equipment: ['cable machine'], category: 'strength' },
  { id: '12', name: 'Tricep Pushdown', muscleGroups: ['triceps'], equipment: ['cable machine'], category: 'strength' },
  { id: '13', name: 'Bicep Curl', muscleGroups: ['biceps'], equipment: ['dumbbell', 'barbell'], category: 'strength' },
  { id: '14', name: 'Plank', muscleGroups: ['core', 'abs'], equipment: ['bodyweight'], category: 'strength' },
  { id: '15', name: 'Treadmill Run', muscleGroups: ['legs', 'cardiovascular'], equipment: ['treadmill'], category: 'cardio' },
  { id: '16', name: 'Stationary Bike', muscleGroups: ['legs', 'cardiovascular'], equipment: ['bike'], category: 'cardio' },
  { id: '17', name: 'Hip Thrust', muscleGroups: ['glutes', 'hamstrings'], equipment: ['barbell', 'bench'], category: 'strength' },
  { id: '18', name: 'Dumbbell Lunge', muscleGroups: ['quads', 'glutes', 'hamstrings'], equipment: ['dumbbell'], category: 'strength' },
  { id: '19', name: 'Calf Raise', muscleGroups: ['calves'], equipment: ['machine', 'barbell'], category: 'strength' },
  { id: '20', name: 'Hammer Curl', muscleGroups: ['biceps', 'brachialis'], equipment: ['dumbbell'], category: 'strength' },
];

const CATEGORIES = ['All', 'strength', 'cardio', 'flexibility', 'plyometric'];
const MUSCLE_GROUPS = [
  'All', 'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'quads', 'hamstrings', 'glutes', 'calves', 'core', 'lats',
];

interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void;
  selectedIds?: string[];
}

export function ExercisePicker({ onSelect, selectedIds = [] }: ExercisePickerProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [muscle, setMuscle] = useState('All');

  const filtered = useMemo(() => {
    return EXERCISES.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || ex.category === category;
      const matchesMuscle =
        muscle === 'All' ||
        ex.muscleGroups.some((m) => m.toLowerCase().includes(muscle.toLowerCase()));
      return matchesSearch && matchesCategory && matchesMuscle;
    });
  }, [search, category, muscle]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-slate-200">
        <Input
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Filters */}
      <div className="p-3 border-b border-slate-200 space-y-2">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-full font-medium transition-colors capitalize',
                category === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {MUSCLE_GROUPS.slice(0, 8).map((m) => (
            <button
              key={m}
              onClick={() => setMuscle(m)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-full font-medium transition-colors capitalize',
                muscle === m
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Dumbbell className="h-8 w-8 mb-2" />
            <p className="text-sm">No exercises found</p>
          </div>
        ) : (
          filtered.map((exercise) => {
            const isSelected = selectedIds.includes(exercise.id);
            return (
              <div
                key={exercise.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors',
                  isSelected && 'bg-brand-50'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{exercise.name}</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {exercise.muscleGroups.slice(0, 3).map((m) => (
                      <Badge key={m} variant="default" size="sm" className="capitalize">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant={isSelected ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => onSelect(exercise)}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  disabled={isSelected}
                >
                  {isSelected ? 'Added' : 'Add'}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ExercisePicker;
