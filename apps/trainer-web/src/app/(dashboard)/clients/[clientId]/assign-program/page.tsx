'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useClient } from '@/hooks/useClients';
import { useAssignProgram, useGenerateProgram, useTemplates } from '@/hooks/usePrograms';
import { ProgramBuilder } from '@/components/programs/ProgramBuilder';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { cn, getInitials, getAvatarColor, formatGoal, formatSplitType, formatExperienceLevel } from '@/lib/utils';
import { Program, GoalType, ExperienceLevel } from '@/types';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  Plus,
  Library,
  CheckCircle,
  Loader2,
  Dumbbell,
} from 'lucide-react';

type Source = 'ai' | 'template' | 'new' | 'library';
type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { number: 1 as Step, label: 'Choose Source' },
  { number: 2 as Step, label: 'Configure' },
  { number: 3 as Step, label: 'Review Program' },
  { number: 4 as Step, label: 'Confirm' },
];

const GOAL_OPTIONS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'strength', label: 'Strength' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'sport_performance', label: 'Sport Performance' },
];

const DAYS_OPTIONS = [
  { value: '2', label: '2 days / week' },
  { value: '3', label: '3 days / week' },
  { value: '4', label: '4 days / week' },
  { value: '5', label: '5 days / week' },
  { value: '6', label: '6 days / week' },
];

const DURATION_OPTIONS = [
  { value: '4', label: '4 weeks' },
  { value: '6', label: '6 weeks' },
  { value: '8', label: '8 weeks' },
  { value: '12', label: '12 weeks' },
  { value: '16', label: '16 weeks' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const EQUIPMENT_OPTIONS = [
  'Barbell', 'Dumbbell', 'Cables', 'Machines', 'Kettlebells', 'Pull-up Bar', 'Bodyweight Only',
];

function generateMockProgram(config: {
  goal: GoalType;
  daysPerWeek: number;
  durationWeeks: number;
  experienceLevel: ExperienceLevel;
}): Partial<Program> {
  const dayNames = ['Push Day', 'Pull Day', 'Leg Day', 'Rest', 'Upper Body', 'Lower Body', 'Cardio & Core'];
  const weeks = Array.from({ length: config.durationWeeks }, (_, wi) => ({
    id: `week-${wi}`,
    weekNumber: wi + 1,
    days: Array.from({ length: 7 }, (_, di) => ({
      id: `week-${wi}-day-${di}`,
      dayNumber: di + 1,
      name: di < config.daysPerWeek ? dayNames[di % dayNames.length] : `Day ${di + 1}`,
      isRestDay: di >= config.daysPerWeek,
      exercises: [],
      focus: di < config.daysPerWeek ? dayNames[di % dayNames.length] : undefined,
    })),
  }));

  return {
    name: `${config.durationWeeks}-Week ${formatGoal(config.goal)} Program`,
    goal: config.goal,
    daysPerWeek: config.daysPerWeek,
    durationWeeks: config.durationWeeks,
    experienceLevel: config.experienceLevel,
    weeks,
    isTemplate: false,
  };
}

export default function AssignProgramPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const [step, setStep] = useState<Step>(1);
  const [source, setSource] = useState<Source | null>(null);
  const [goal, setGoal] = useState<GoalType>('general_fitness');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('intermediate');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['Barbell', 'Dumbbell', 'Cables']);
  const [program, setProgram] = useState<Partial<Program>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: client } = useClient(clientId);
  const { data: templates } = useTemplates();
  const assignProgram = useAssignProgram(clientId);

  const clientDisplay = client || { name: 'Client', goal: 'general_fitness' as GoalType, experienceLevel: 'intermediate' as ExperienceLevel };

  const handleGenerateProgram = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((r) => setTimeout(r, 2000));
    const generated = generateMockProgram({ goal, daysPerWeek, durationWeeks, experienceLevel });
    setProgram(generated);
    setIsGenerating(false);
    setStep(3);
  };

  const handleNext = async () => {
    if (step === 1 && source) {
      setStep(2);
    } else if (step === 2) {
      if (source === 'ai') {
        await handleGenerateProgram();
      } else if (source === 'new') {
        const newProgram = generateMockProgram({ goal, daysPerWeek, durationWeeks, experienceLevel });
        setProgram(newProgram);
        setStep(3);
      } else {
        setStep(3);
      }
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleAssign = async () => {
    try {
      await assignProgram.mutateAsync({
        source: source!,
        goal,
        daysPerWeek,
        durationWeeks,
        equipment: selectedEquipment,
        experienceLevel,
      });
      router.push(`/clients/${clientId}?tab=program`);
    } catch {
      // Show mock success in demo
      router.push(`/clients/${clientId}?tab=program`);
    }
  };

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  return (
    <div className="page-container max-w-4xl">
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/clients/${clientId}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Client
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900">Assign Program</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Assign a training program to{' '}
          <span className="font-medium text-slate-700">{clientDisplay.name}</span>
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.number}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                  step > s.number
                    ? 'bg-success-500 text-white'
                    : step === s.number
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-200 text-slate-400'
                )}
              >
                {step > s.number ? <CheckCircle className="h-5 w-5" /> : s.number}
              </div>
              <span
                className={cn(
                  'text-sm font-medium hidden sm:block',
                  step === s.number ? 'text-slate-900' : 'text-slate-400'
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2',
                  step > s.number ? 'bg-success-500' : 'bg-slate-200'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Choose source */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 text-lg">Choose Program Source</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                value: 'ai' as Source,
                icon: <Sparkles className="h-7 w-7 text-purple-600" />,
                bg: 'bg-purple-50 border-purple-200 hover:border-purple-400',
                activeBg: 'bg-purple-50 border-purple-600',
                title: 'Generate with AI',
                description: 'Let AI create a personalized program based on client goals',
                badge: 'Recommended',
                badgeColor: 'bg-purple-100 text-purple-700',
              },
              {
                value: 'template' as Source,
                icon: <BookOpen className="h-7 w-7 text-brand-600" />,
                bg: 'bg-brand-50 border-brand-200 hover:border-brand-400',
                activeBg: 'bg-brand-50 border-brand-600',
                title: 'Use Template',
                description: 'Select from your saved program templates',
                badge: `${templates?.total || 0} templates`,
                badgeColor: 'bg-brand-100 text-brand-700',
              },
              {
                value: 'new' as Source,
                icon: <Plus className="h-7 w-7 text-green-600" />,
                bg: 'bg-green-50 border-green-200 hover:border-green-400',
                activeBg: 'bg-green-50 border-green-600',
                title: 'Create New',
                description: 'Build a custom program from scratch',
                badge: 'Fully custom',
                badgeColor: 'bg-green-100 text-green-700',
              },
              {
                value: 'library' as Source,
                icon: <Library className="h-7 w-7 text-orange-600" />,
                bg: 'bg-orange-50 border-orange-200 hover:border-orange-400',
                activeBg: 'bg-orange-50 border-orange-600',
                title: 'From Library',
                description: 'Browse community-shared workout programs',
                badge: 'Browse library',
                badgeColor: 'bg-orange-100 text-orange-700',
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSource(option.value)}
                className={cn(
                  'flex flex-col gap-3 p-5 rounded-xl border-2 transition-all text-left',
                  source === option.value ? option.activeBg : option.bg
                )}
              >
                <div className="flex items-start justify-between">
                  {option.icon}
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', option.badgeColor)}>
                    {option.badge}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{option.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{option.description}</p>
                </div>
                {source === option.value && (
                  <div className="flex items-center gap-1.5 text-sm font-medium text-brand-600">
                    <CheckCircle className="h-4 w-4" />
                    Selected
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="font-semibold text-slate-900 text-lg">Configure Program</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Goal"
              options={GOAL_OPTIONS}
              value={goal}
              onChange={(e) => setGoal(e.target.value as GoalType)}
            />
            <Select
              label="Experience Level"
              options={EXPERIENCE_OPTIONS}
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
            />
            <Select
              label="Training Days per Week"
              options={DAYS_OPTIONS}
              value={String(daysPerWeek)}
              onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
            />
            <Select
              label="Program Duration"
              options={DURATION_OPTIONS}
              value={String(durationWeeks)}
              onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
            />
          </div>

          {(source === 'ai' || source === 'new') && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Available Equipment
              </label>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleEquipment(item)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                      selectedEquipment.includes(item)
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {source === 'template' && templates?.data && templates.data.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-3">
                Select Template
              </label>
              <div className="space-y-2">
                {templates.data.slice(0, 5).map((tmpl) => (
                  <div key={tmpl.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-brand-300 cursor-pointer">
                    <Dumbbell className="h-5 w-5 text-brand-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{tmpl.name}</p>
                      <p className="text-xs text-slate-500">{tmpl.durationWeeks}w · {tmpl.daysPerWeek}d/wk · {formatSplitType(tmpl.splitType)}</p>
                    </div>
                    <Badge variant="primary">{formatGoal(tmpl.goal)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-2xl bg-purple-100 mb-4">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
              <h3 className="font-semibold text-slate-900">Generating Program...</h3>
              <p className="text-sm text-slate-500 mt-1">AI is creating a personalized plan for {clientDisplay.name}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-lg">Review Program</h3>
                <p className="text-sm text-slate-500">
                  {program.durationWeeks}w · {program.daysPerWeek}d/wk
                </p>
              </div>
              <ProgramBuilder program={program} onChange={setProgram} readOnly={false} />
            </>
          )}
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="space-y-6">
          <h3 className="font-semibold text-slate-900 text-lg">Confirm Assignment</h3>
          <Card className="bg-slate-50">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold', getAvatarColor(clientDisplay.name))}>
                {getInitials(clientDisplay.name)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{clientDisplay.name}</p>
                <p className="text-sm text-slate-500">{formatGoal(clientDisplay.goal)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Program', value: program.name || 'Custom Program' },
                { label: 'Duration', value: `${durationWeeks} weeks` },
                { label: 'Days/Week', value: `${daysPerWeek} days` },
                { label: 'Level', value: formatExperienceLevel(experienceLevel) },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
            <p className="text-sm text-brand-800">
              This program will be assigned immediately and the client will be notified in the app.
              You can make edits after assigning.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
        <Button
          variant="outline"
          onClick={() => step > 1 ? setStep((step - 1) as Step) : router.back()}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < 4 ? (
          <Button
            onClick={handleNext}
            disabled={step === 1 && !source}
            loading={isGenerating}
            rightIcon={!isGenerating ? <ArrowRight className="h-4 w-4" /> : undefined}
          >
            {step === 2 && source === 'ai' ? 'Generate Program' : 'Continue'}
          </Button>
        ) : (
          <Button
            onClick={handleAssign}
            loading={assignProgram.isPending}
            leftIcon={<CheckCircle className="h-4 w-4" />}
          >
            Assign Program
          </Button>
        )}
      </div>
    </div>
  );
}
