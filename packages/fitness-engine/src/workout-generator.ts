export type SplitType =
  | 'FULL_BODY'
  | 'UPPER_LOWER'
  | 'PPL'
  | 'BODY_PART'
  | 'PUSH_PULL_LEGS';

export interface ExerciseTemplate {
  slug: string;
  muscleGroup: string;
  type: 'compound' | 'isolation';
  order?: number;
}

export interface SetRepScheme {
  sets: number;
  repsMin: number;
  repsMax: number;
  intensityMin: number; // % of 1RM
  intensityMax: number; // % of 1RM
}

export interface GeneratedDay {
  dayNumber: number;
  dayType: string;
  exercises: ExerciseTemplate[];
  setRepScheme: SetRepScheme;
  restTimeSecs: number;
}

export interface GeneratedWeek {
  weekNumber: number;
  days: GeneratedDay[];
}

export interface GenerateProgramParams {
  goal: string;
  experience: string;
  daysPerWeek: number;
  equipment: string;
  sessionDurationMins?: number;
  injuries?: string[];
}

export interface GeneratedProgram {
  splitType: SplitType;
  weeksTotal: number;
  daysPerWeek: number;
  weeks: GeneratedWeek[];
  setRepScheme: SetRepScheme;
  restTimeSecs: number;
}

// ---------------------------------------------------------------------------
// Exercise library (slugs only – full data lives in the DB/CMS)
// ---------------------------------------------------------------------------

const EXERCISE_LIBRARY: Record<string, ExerciseTemplate[]> = {
  // Full-body days
  FULL_BODY: [
    { slug: 'barbell-squat', muscleGroup: 'quads', type: 'compound' },
    { slug: 'barbell-deadlift', muscleGroup: 'hamstrings', type: 'compound' },
    { slug: 'barbell-bench-press', muscleGroup: 'chest', type: 'compound' },
    { slug: 'barbell-row', muscleGroup: 'back', type: 'compound' },
    { slug: 'overhead-press', muscleGroup: 'shoulders', type: 'compound' },
    { slug: 'pull-up', muscleGroup: 'back', type: 'compound' },
    { slug: 'dumbbell-curl', muscleGroup: 'biceps', type: 'isolation' },
    { slug: 'tricep-pushdown', muscleGroup: 'triceps', type: 'isolation' },
  ],

  // Upper body
  UPPER: [
    { slug: 'barbell-bench-press', muscleGroup: 'chest', type: 'compound' },
    { slug: 'barbell-row', muscleGroup: 'back', type: 'compound' },
    { slug: 'overhead-press', muscleGroup: 'shoulders', type: 'compound' },
    { slug: 'pull-up', muscleGroup: 'back', type: 'compound' },
    { slug: 'incline-dumbbell-press', muscleGroup: 'chest', type: 'compound' },
    { slug: 'dumbbell-curl', muscleGroup: 'biceps', type: 'isolation' },
    { slug: 'tricep-pushdown', muscleGroup: 'triceps', type: 'isolation' },
    { slug: 'lateral-raise', muscleGroup: 'shoulders', type: 'isolation' },
  ],

  // Lower body
  LOWER: [
    { slug: 'barbell-squat', muscleGroup: 'quads', type: 'compound' },
    { slug: 'romanian-deadlift', muscleGroup: 'hamstrings', type: 'compound' },
    { slug: 'leg-press', muscleGroup: 'quads', type: 'compound' },
    { slug: 'barbell-hip-thrust', muscleGroup: 'glutes', type: 'compound' },
    { slug: 'leg-curl', muscleGroup: 'hamstrings', type: 'isolation' },
    { slug: 'leg-extension', muscleGroup: 'quads', type: 'isolation' },
    { slug: 'calf-raise', muscleGroup: 'calves', type: 'isolation' },
  ],

  // Push (chest, shoulders, triceps)
  PUSH: [
    { slug: 'barbell-bench-press', muscleGroup: 'chest', type: 'compound' },
    { slug: 'overhead-press', muscleGroup: 'shoulders', type: 'compound' },
    { slug: 'incline-dumbbell-press', muscleGroup: 'chest', type: 'compound' },
    { slug: 'dumbbell-lateral-raise', muscleGroup: 'shoulders', type: 'isolation' },
    { slug: 'tricep-pushdown', muscleGroup: 'triceps', type: 'isolation' },
    { slug: 'overhead-tricep-extension', muscleGroup: 'triceps', type: 'isolation' },
  ],

  // Pull (back, biceps)
  PULL: [
    { slug: 'barbell-row', muscleGroup: 'back', type: 'compound' },
    { slug: 'pull-up', muscleGroup: 'back', type: 'compound' },
    { slug: 'cable-row', muscleGroup: 'back', type: 'compound' },
    { slug: 'lat-pulldown', muscleGroup: 'back', type: 'compound' },
    { slug: 'dumbbell-curl', muscleGroup: 'biceps', type: 'isolation' },
    { slug: 'hammer-curl', muscleGroup: 'biceps', type: 'isolation' },
  ],

  // Legs (for PPL/Body Part splits)
  LEGS: [
    { slug: 'barbell-squat', muscleGroup: 'quads', type: 'compound' },
    { slug: 'barbell-deadlift', muscleGroup: 'hamstrings', type: 'compound' },
    { slug: 'leg-press', muscleGroup: 'quads', type: 'compound' },
    { slug: 'barbell-hip-thrust', muscleGroup: 'glutes', type: 'compound' },
    { slug: 'leg-curl', muscleGroup: 'hamstrings', type: 'isolation' },
    { slug: 'leg-extension', muscleGroup: 'quads', type: 'isolation' },
    { slug: 'calf-raise', muscleGroup: 'calves', type: 'isolation' },
  ],
};

// Equipment-filtered slugs (bodyweight alternatives when no barbell)
const BODYWEIGHT_SUBSTITUTES: Record<string, string> = {
  'barbell-squat': 'bodyweight-squat',
  'barbell-deadlift': 'single-leg-deadlift',
  'barbell-bench-press': 'push-up',
  'barbell-row': 'inverted-row',
  'overhead-press': 'pike-push-up',
  'pull-up': 'pull-up',
  'barbell-hip-thrust': 'glute-bridge',
  'incline-dumbbell-press': 'incline-push-up',
  'leg-press': 'bulgarian-split-squat',
  'romanian-deadlift': 'single-leg-hip-hinge',
};

const DUMBBELL_SUBSTITUTES: Record<string, string> = {
  'barbell-squat': 'dumbbell-goblet-squat',
  'barbell-deadlift': 'dumbbell-deadlift',
  'barbell-bench-press': 'dumbbell-bench-press',
  'barbell-row': 'dumbbell-row',
  'overhead-press': 'dumbbell-overhead-press',
  'barbell-hip-thrust': 'dumbbell-hip-thrust',
  'incline-dumbbell-press': 'incline-dumbbell-press',
  'leg-press': 'dumbbell-goblet-squat',
  'romanian-deadlift': 'dumbbell-romanian-deadlift',
};

// ---------------------------------------------------------------------------
// Set/rep schemes per goal
// ---------------------------------------------------------------------------

const SET_REP_SCHEMES: Record<string, SetRepScheme> = {
  STRENGTH: { sets: 4, repsMin: 1, repsMax: 5, intensityMin: 85, intensityMax: 95 },
  BUILD_MUSCLE: { sets: 3, repsMin: 8, repsMax: 12, intensityMin: 65, intensityMax: 75 },
  HYPERTROPHY: { sets: 3, repsMin: 8, repsMax: 12, intensityMin: 65, intensityMax: 75 },
  LOSE_FAT: { sets: 3, repsMin: 12, repsMax: 15, intensityMin: 60, intensityMax: 70 },
  ENDURANCE: { sets: 2, repsMin: 15, repsMax: 20, intensityMin: 50, intensityMax: 60 },
  MAINTENANCE: { sets: 3, repsMin: 8, repsMax: 12, intensityMin: 65, intensityMax: 75 },
  RECOMPOSITION: { sets: 3, repsMin: 10, repsMax: 15, intensityMin: 60, intensityMax: 75 },
};

// ---------------------------------------------------------------------------
// Rest times per goal (seconds)
// ---------------------------------------------------------------------------

const REST_TIMES: Record<string, number> = {
  STRENGTH: 240, // midpoint of 180-300s
  BUILD_MUSCLE: 105, // midpoint of 90-120s
  HYPERTROPHY: 105,
  LOSE_FAT: 60,
  ENDURANCE: 45, // midpoint of 30-60s
  MAINTENANCE: 90,
  RECOMPOSITION: 75,
};

// ---------------------------------------------------------------------------
// WorkoutGenerator
// ---------------------------------------------------------------------------

export class WorkoutGenerator {
  /**
   * Determine the best split type given training days, goal, and experience.
   */
  getSplitType(days: number, goal: string, experience: string): SplitType {
    const isBeginnerOrNovice =
      experience.toUpperCase() === 'BEGINNER' || experience.toUpperCase() === 'NOVICE';
    const normalizedGoal = goal.toUpperCase();

    if (days <= 2) {
      return 'FULL_BODY';
    }

    if (days === 3) {
      // Beginners benefit most from full-body; experienced lifters can do PPL
      if (isBeginnerOrNovice) {
        return 'FULL_BODY';
      }
      return normalizedGoal === 'STRENGTH' ? 'FULL_BODY' : 'PPL';
    }

    if (days === 4) {
      if (isBeginnerOrNovice) {
        return 'UPPER_LOWER';
      }
      return 'UPPER_LOWER';
    }

    // 5-6 days
    if (isBeginnerOrNovice) {
      return 'UPPER_LOWER';
    }
    return normalizedGoal === 'STRENGTH' ? 'PPL' : 'BODY_PART';
  }

  /**
   * Build the sequence of day types for a given split and day count.
   */
  private getDayTypes(splitType: SplitType, daysPerWeek: number): string[] {
    switch (splitType) {
      case 'FULL_BODY':
        return Array(daysPerWeek).fill('FULL_BODY');

      case 'UPPER_LOWER': {
        const sequence = ['UPPER', 'LOWER', 'UPPER', 'LOWER', 'UPPER', 'LOWER'];
        return sequence.slice(0, daysPerWeek);
      }

      case 'PPL':
      case 'PUSH_PULL_LEGS': {
        const ppl = ['PUSH', 'PULL', 'LEGS', 'PUSH', 'PULL', 'LEGS'];
        return ppl.slice(0, daysPerWeek);
      }

      case 'BODY_PART': {
        const bodyPart = ['PUSH', 'PULL', 'LEGS', 'UPPER', 'LOWER', 'FULL_BODY'];
        return bodyPart.slice(0, daysPerWeek);
      }

      default:
        return Array(daysPerWeek).fill('FULL_BODY');
    }
  }

  /**
   * Return exercises for a given day type, respecting equipment constraints.
   */
  getExercisesForDay(
    dayType: string,
    equipment: string,
    experience: string,
  ): ExerciseTemplate[] {
    const normalizedDay = dayType.toUpperCase();
    const exercises: ExerciseTemplate[] = EXERCISE_LIBRARY[normalizedDay] ?? EXERCISE_LIBRARY['FULL_BODY'];
    const normalizedEquipment = equipment.toUpperCase();
    const isBeginnerLevel = experience.toUpperCase() === 'BEGINNER';

    let result = exercises.map((ex) => {
      if (normalizedEquipment === 'BODYWEIGHT') {
        const substitute = BODYWEIGHT_SUBSTITUTES[ex.slug];
        return substitute ? { ...ex, slug: substitute } : ex;
      }
      if (normalizedEquipment === 'DUMBBELLS') {
        const substitute = DUMBBELL_SUBSTITUTES[ex.slug];
        return substitute ? { ...ex, slug: substitute } : ex;
      }
      return { ...ex };
    });

    // Beginners do fewer exercises per session
    if (isBeginnerLevel) {
      result = result.filter((ex) => ex.type === 'compound').slice(0, 4);
    }

    return this.getExerciseOrder(result);
  }

  /**
   * Return the appropriate set/rep scheme for a goal and experience level.
   */
  getSetRepScheme(goalType: string, experienceLevel: string): SetRepScheme {
    const normalizedGoal = goalType.toUpperCase();
    const scheme = SET_REP_SCHEMES[normalizedGoal] ?? SET_REP_SCHEMES['BUILD_MUSCLE'];

    // Beginners use the lower end of set counts
    if (experienceLevel.toUpperCase() === 'BEGINNER') {
      return { ...scheme, sets: Math.max(2, scheme.sets - 1) };
    }

    return { ...scheme };
  }

  /**
   * Return rest time in seconds for a given goal type.
   */
  getRestTime(goalType: string): number {
    const normalizedGoal = goalType.toUpperCase();
    return REST_TIMES[normalizedGoal] ?? REST_TIMES['BUILD_MUSCLE'];
  }

  /**
   * Order exercises: compound before isolation, large muscle groups before small.
   */
  getExerciseOrder(exercises: ExerciseTemplate[]): ExerciseTemplate[] {
    const muscleGroupSize: Record<string, number> = {
      quads: 1,
      hamstrings: 2,
      glutes: 3,
      back: 4,
      chest: 5,
      shoulders: 6,
      triceps: 7,
      biceps: 8,
      calves: 9,
      core: 10,
    };

    return [...exercises].sort((a, b) => {
      // Compound before isolation
      if (a.type === 'compound' && b.type === 'isolation') return -1;
      if (a.type === 'isolation' && b.type === 'compound') return 1;

      // Among same type, large muscle groups first
      const aSize = muscleGroupSize[a.muscleGroup] ?? 99;
      const bSize = muscleGroupSize[b.muscleGroup] ?? 99;
      return aSize - bSize;
    });
  }

  /**
   * Generate a full training program.
   */
  generateProgram(params: GenerateProgramParams): GeneratedProgram {
    const { goal, experience, daysPerWeek, equipment, sessionDurationMins: _sessionDurationMins, injuries: _injuries } = params;

    const splitType = this.getSplitType(daysPerWeek, goal, experience);
    const setRepScheme = this.getSetRepScheme(goal, experience);
    const restTimeSecs = this.getRestTime(goal);
    const dayTypes = this.getDayTypes(splitType, daysPerWeek);

    // Standard programs run 4-12 weeks depending on experience
    const weeksTotal =
      experience.toUpperCase() === 'BEGINNER'
        ? 8
        : experience.toUpperCase() === 'INTERMEDIATE'
          ? 10
          : 12;

    const templateWeek: GeneratedWeek = {
      weekNumber: 1,
      days: dayTypes.map((dayType, idx) => ({
        dayNumber: idx + 1,
        dayType,
        exercises: this.getExercisesForDay(dayType, equipment, experience),
        setRepScheme,
        restTimeSecs,
      })),
    };

    // Generate all weeks (same structure, progressive overload applied externally)
    const weeks: GeneratedWeek[] = Array.from({ length: weeksTotal }, (_, weekIdx) => ({
      ...templateWeek,
      weekNumber: weekIdx + 1,
    }));

    return {
      splitType,
      weeksTotal,
      daysPerWeek,
      weeks,
      setRepScheme,
      restTimeSecs,
    };
  }
}
