'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ExercisePicker } from './ExercisePicker';
import { Program, ProgramDay, ProgramExercise, Exercise } from '@/types';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Dumbbell,
  Coffee,
  Edit2,
  Search,
} from 'lucide-react';

interface ProgramBuilderProps {
  program: Partial<Program>;
  onChange: (program: Partial<Program>) => void;
  readOnly?: boolean;
}

interface DayCardProps {
  day: ProgramDay;
  weekNumber: number;
  onToggleRest: () => void;
  onAddExercise: (exercise: Exercise) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onUpdateExercise: (exerciseId: string, field: string, value: unknown) => void;
  readOnly?: boolean;
}

function SetRow({
  setNum,
  reps,
  weight,
  rest,
  onUpdate,
  readOnly,
}: {
  setNum: number;
  reps?: number;
  weight?: number;
  rest: number;
  onUpdate: (field: string, value: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 items-center text-xs">
      <span className="text-slate-400 font-medium">Set {setNum}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={reps || ''}
          onChange={(e) => onUpdate('reps', parseInt(e.target.value))}
          placeholder="reps"
          disabled={readOnly}
          className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-center disabled:bg-slate-50"
        />
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={weight || ''}
          onChange={(e) => onUpdate('weight', parseFloat(e.target.value))}
          placeholder="kg"
          disabled={readOnly}
          className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-center disabled:bg-slate-50"
        />
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={rest}
          onChange={(e) => onUpdate('restSeconds', parseInt(e.target.value))}
          placeholder="rest"
          disabled={readOnly}
          className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-center disabled:bg-slate-50"
        />
      </div>
    </div>
  );
}

function ExerciseCard({
  programExercise,
  onRemove,
  onUpdate,
  readOnly,
}: {
  programExercise: ProgramExercise;
  onRemove: () => void;
  onUpdate: (field: string, value: unknown) => void;
  readOnly?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Exercise header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50">
        {!readOnly && <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {programExercise.exercise.name}
          </p>
          <div className="flex gap-1 mt-0.5">
            {programExercise.exercise.muscleGroups.slice(0, 2).map((m) => (
              <Badge key={m} variant="default" size="sm" className="capitalize">
                {m}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-slate-500">
            {programExercise.sets.length} sets
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {!readOnly && (
            <button
              onClick={onRemove}
              className="p-1 rounded text-slate-400 hover:text-danger-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sets */}
      {expanded && (
        <div className="p-3 space-y-2">
          {/* Column headers */}
          <div className="grid grid-cols-4 gap-2 text-xs font-medium text-slate-400 px-0">
            <span>Set</span>
            <span className="text-center">Reps</span>
            <span className="text-center">Weight</span>
            <span className="text-center">Rest (s)</span>
          </div>

          {programExercise.sets.map((set, i) => (
            <SetRow
              key={i}
              setNum={set.setNumber}
              reps={set.reps}
              weight={set.weight}
              rest={set.restSeconds}
              onUpdate={(field, value) => {
                const newSets = [...programExercise.sets];
                newSets[i] = { ...newSets[i], [field]: value };
                onUpdate('sets', newSets);
              }}
              readOnly={readOnly}
            />
          ))}

          {!readOnly && (
            <button
              onClick={() => {
                const lastSet = programExercise.sets[programExercise.sets.length - 1];
                const newSets = [
                  ...programExercise.sets,
                  {
                    setNumber: programExercise.sets.length + 1,
                    reps: lastSet?.reps || 10,
                    weight: lastSet?.weight,
                    restSeconds: lastSet?.restSeconds || 60,
                  },
                ];
                onUpdate('sets', newSets);
              }}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium mt-1"
            >
              + Add Set
            </button>
          )}

          <div>
            <input
              type="text"
              value={programExercise.notes || ''}
              onChange={(e) => onUpdate('notes', e.target.value)}
              placeholder="Add notes (form cues, tempo, etc.)"
              disabled={readOnly}
              className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DayCard({
  day,
  weekNumber,
  onToggleRest,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  readOnly,
}: DayCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        {/* Day header */}
        <div
          className={cn(
            'flex items-center justify-between px-4 py-3 cursor-pointer',
            day.isRestDay ? 'bg-slate-50' : 'bg-white'
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold',
                day.isRestDay
                  ? 'bg-slate-200 text-slate-500'
                  : 'bg-brand-600 text-white'
              )}
            >
              {day.dayNumber}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{day.name}</p>
              {!day.isRestDay && (
                <p className="text-xs text-slate-500">
                  {day.exercises.length} exercises
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!readOnly && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRest();
                }}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                  day.isRestDay
                    ? 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {day.isRestDay ? (
                  <>
                    <Dumbbell className="h-3.5 w-3.5" />
                    Training Day
                  </>
                ) : (
                  <>
                    <Coffee className="h-3.5 w-3.5" />
                    Rest Day
                  </>
                )}
              </button>
            )}
            {collapsed ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* Day content */}
        {!collapsed && !day.isRestDay && (
          <div className="p-4 space-y-3 border-t border-slate-100">
            {day.exercises.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Dumbbell className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm text-slate-400">No exercises added yet</p>
              </div>
            ) : (
              day.exercises.map((pe) => (
                <ExerciseCard
                  key={pe.id}
                  programExercise={pe}
                  onRemove={() => onRemoveExercise(pe.id)}
                  onUpdate={(field, value) => onUpdateExercise(pe.id, field, value)}
                  readOnly={readOnly}
                />
              ))
            )}

            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                fullWidth
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setPickerOpen(true)}
              >
                Add Exercise
              </Button>
            )}
          </div>
        )}

        {!collapsed && day.isRestDay && (
          <div className="px-4 py-6 border-t border-slate-100 flex items-center justify-center">
            <div className="text-center">
              <Coffee className="h-6 w-6 text-slate-300 mx-auto mb-1" />
              <p className="text-sm text-slate-400">Rest & Recovery</p>
            </div>
          </div>
        )}
      </div>

      {/* Exercise picker modal */}
      <Modal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Add Exercise"
        size="lg"
        className="h-[85vh] flex flex-col"
      >
        <div className="-mt-6 -mx-6 flex-1 overflow-hidden">
          <ExercisePicker
            onSelect={(exercise) => {
              onAddExercise(exercise);
              setPickerOpen(false);
            }}
            selectedIds={day.exercises.map((e) => e.exerciseId)}
          />
        </div>
      </Modal>
    </>
  );
}

export function ProgramBuilder({ program, onChange, readOnly = false }: ProgramBuilderProps) {
  const [activeWeek, setActiveWeek] = useState(0);

  const weeks = program.weeks || [];
  const currentWeek = weeks[activeWeek];

  const updateWeeks = (newWeeks: typeof weeks) => {
    onChange({ ...program, weeks: newWeeks });
  };

  const toggleRestDay = (dayIndex: number) => {
    const newWeeks = [...weeks];
    const day = newWeeks[activeWeek].days[dayIndex];
    newWeeks[activeWeek].days[dayIndex] = {
      ...day,
      isRestDay: !day.isRestDay,
      exercises: day.isRestDay ? [] : day.exercises,
    };
    updateWeeks(newWeeks);
  };

  const addExercise = (dayIndex: number, exercise: Exercise) => {
    const newWeeks = [...weeks];
    const day = newWeeks[activeWeek].days[dayIndex];
    const newExercise: ProgramExercise = {
      id: `ex-${Date.now()}`,
      exerciseId: exercise.id,
      exercise,
      order: day.exercises.length,
      sets: [
        { setNumber: 1, reps: 10, restSeconds: 60 },
        { setNumber: 2, reps: 10, restSeconds: 60 },
        { setNumber: 3, reps: 10, restSeconds: 60 },
      ],
    };
    newWeeks[activeWeek].days[dayIndex] = {
      ...day,
      exercises: [...day.exercises, newExercise],
    };
    updateWeeks(newWeeks);
  };

  const removeExercise = (dayIndex: number, exerciseId: string) => {
    const newWeeks = [...weeks];
    newWeeks[activeWeek].days[dayIndex].exercises = newWeeks[activeWeek].days[
      dayIndex
    ].exercises.filter((e) => e.id !== exerciseId);
    updateWeeks(newWeeks);
  };

  const updateExercise = (
    dayIndex: number,
    exerciseId: string,
    field: string,
    value: unknown
  ) => {
    const newWeeks = [...weeks];
    const day = newWeeks[activeWeek].days[dayIndex];
    day.exercises = day.exercises.map((e) =>
      e.id === exerciseId ? { ...e, [field]: value } : e
    );
    updateWeeks(newWeeks);
  };

  if (!currentWeek) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400">
        <p className="text-sm">No weeks configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week tabs */}
      {weeks.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {weeks.map((week, i) => (
            <button
              key={week.id}
              onClick={() => setActiveWeek(i)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0',
                activeWeek === i
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              Week {week.weekNumber}
            </button>
          ))}
        </div>
      )}

      {/* Program name */}
      {!readOnly && (
        <div>
          <Input
            label="Program Name"
            value={program.name || ''}
            onChange={(e) => onChange({ ...program, name: e.target.value })}
            placeholder="e.g., 12-Week Strength Builder"
          />
        </div>
      )}

      {/* Days */}
      <div className="space-y-3">
        {currentWeek.days.map((day, dayIndex) => (
          <DayCard
            key={day.id}
            day={day}
            weekNumber={activeWeek + 1}
            onToggleRest={() => toggleRestDay(dayIndex)}
            onAddExercise={(exercise) => addExercise(dayIndex, exercise)}
            onRemoveExercise={(exerciseId) => removeExercise(dayIndex, exerciseId)}
            onUpdateExercise={(exerciseId, field, value) =>
              updateExercise(dayIndex, exerciseId, field, value)
            }
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

export default ProgramBuilder;
