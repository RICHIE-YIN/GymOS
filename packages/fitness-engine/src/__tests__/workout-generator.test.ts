import { WorkoutGenerator } from '../workout-generator';
import { ProgressionEngine } from '../progression';

const generator = new WorkoutGenerator();
const progression = new ProgressionEngine();

// ---------------------------------------------------------------------------
// getSplitType
// ---------------------------------------------------------------------------

describe('WorkoutGenerator.getSplitType', () => {
  it('returns FULL_BODY for 1 day per week', () => {
    expect(generator.getSplitType(1, 'BUILD_MUSCLE', 'INTERMEDIATE')).toBe('FULL_BODY');
  });

  it('returns FULL_BODY for 2 days per week', () => {
    expect(generator.getSplitType(2, 'BUILD_MUSCLE', 'INTERMEDIATE')).toBe('FULL_BODY');
  });

  it('returns FULL_BODY for beginners on 3 days', () => {
    expect(generator.getSplitType(3, 'BUILD_MUSCLE', 'BEGINNER')).toBe('FULL_BODY');
  });

  it('returns PPL for intermediate on 3 days (non-strength goal)', () => {
    expect(generator.getSplitType(3, 'BUILD_MUSCLE', 'INTERMEDIATE')).toBe('PPL');
  });

  it('returns FULL_BODY for intermediate strength on 3 days', () => {
    expect(generator.getSplitType(3, 'STRENGTH', 'INTERMEDIATE')).toBe('FULL_BODY');
  });

  it('returns UPPER_LOWER for 4 days', () => {
    expect(generator.getSplitType(4, 'BUILD_MUSCLE', 'INTERMEDIATE')).toBe('UPPER_LOWER');
  });

  it('returns UPPER_LOWER for beginners on 4 days', () => {
    expect(generator.getSplitType(4, 'BUILD_MUSCLE', 'BEGINNER')).toBe('UPPER_LOWER');
  });

  it('returns UPPER_LOWER for beginners on 5 days', () => {
    expect(generator.getSplitType(5, 'BUILD_MUSCLE', 'BEGINNER')).toBe('UPPER_LOWER');
  });

  it('returns PPL for intermediate strength on 5 days', () => {
    expect(generator.getSplitType(5, 'STRENGTH', 'INTERMEDIATE')).toBe('PPL');
  });

  it('returns BODY_PART for intermediate hypertrophy on 6 days', () => {
    expect(generator.getSplitType(6, 'BUILD_MUSCLE', 'INTERMEDIATE')).toBe('BODY_PART');
  });
});

// ---------------------------------------------------------------------------
// getSetRepScheme
// ---------------------------------------------------------------------------

describe('WorkoutGenerator.getSetRepScheme', () => {
  it('STRENGTH: high intensity, low reps', () => {
    const scheme = generator.getSetRepScheme('STRENGTH', 'INTERMEDIATE');
    expect(scheme.repsMin).toBe(1);
    expect(scheme.repsMax).toBe(5);
    expect(scheme.intensityMin).toBeGreaterThanOrEqual(85);
    expect(scheme.intensityMax).toBeLessThanOrEqual(95);
  });

  it('BUILD_MUSCLE: moderate reps (8-12)', () => {
    const scheme = generator.getSetRepScheme('BUILD_MUSCLE', 'INTERMEDIATE');
    expect(scheme.repsMin).toBe(8);
    expect(scheme.repsMax).toBe(12);
    expect(scheme.intensityMin).toBeGreaterThanOrEqual(65);
    expect(scheme.intensityMax).toBeLessThanOrEqual(75);
  });

  it('LOSE_FAT: higher reps (12-15)', () => {
    const scheme = generator.getSetRepScheme('LOSE_FAT', 'INTERMEDIATE');
    expect(scheme.repsMin).toBe(12);
    expect(scheme.repsMax).toBe(15);
    expect(scheme.intensityMin).toBeGreaterThanOrEqual(60);
    expect(scheme.intensityMax).toBeLessThanOrEqual(70);
  });

  it('ENDURANCE: very high reps (15-20)', () => {
    const scheme = generator.getSetRepScheme('ENDURANCE', 'INTERMEDIATE');
    expect(scheme.repsMin).toBe(15);
    expect(scheme.repsMax).toBe(20);
    expect(scheme.intensityMin).toBeGreaterThanOrEqual(50);
    expect(scheme.intensityMax).toBeLessThanOrEqual(60);
  });

  it('beginners get one fewer set', () => {
    const intermediate = generator.getSetRepScheme('BUILD_MUSCLE', 'INTERMEDIATE');
    const beginner = generator.getSetRepScheme('BUILD_MUSCLE', 'BEGINNER');
    expect(beginner.sets).toBe(intermediate.sets - 1);
  });

  it('beginner set count is at least 2', () => {
    const scheme = generator.getSetRepScheme('ENDURANCE', 'BEGINNER');
    expect(scheme.sets).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// getRestTime
// ---------------------------------------------------------------------------

describe('WorkoutGenerator.getRestTime', () => {
  it('STRENGTH rest time is within 180-300s range', () => {
    const rest = generator.getRestTime('STRENGTH');
    expect(rest).toBeGreaterThanOrEqual(180);
    expect(rest).toBeLessThanOrEqual(300);
  });

  it('BUILD_MUSCLE rest time is within 90-120s range', () => {
    const rest = generator.getRestTime('BUILD_MUSCLE');
    expect(rest).toBeGreaterThanOrEqual(90);
    expect(rest).toBeLessThanOrEqual(120);
  });

  it('LOSE_FAT rest time is 60s', () => {
    expect(generator.getRestTime('LOSE_FAT')).toBe(60);
  });

  it('ENDURANCE rest time is within 30-60s range', () => {
    const rest = generator.getRestTime('ENDURANCE');
    expect(rest).toBeGreaterThanOrEqual(30);
    expect(rest).toBeLessThanOrEqual(60);
  });
});

// ---------------------------------------------------------------------------
// getExercisesForDay
// ---------------------------------------------------------------------------

describe('WorkoutGenerator.getExercisesForDay', () => {
  it('returns exercises for a FULL_BODY day', () => {
    const exercises = generator.getExercisesForDay('FULL_BODY', 'BARBELL', 'INTERMEDIATE');
    expect(exercises.length).toBeGreaterThan(0);
  });

  it('returns exercises for UPPER day', () => {
    const exercises = generator.getExercisesForDay('UPPER', 'BARBELL', 'INTERMEDIATE');
    expect(exercises.length).toBeGreaterThan(0);
  });

  it('applies bodyweight substitutions', () => {
    const exercises = generator.getExercisesForDay('FULL_BODY', 'BODYWEIGHT', 'INTERMEDIATE');
    const slugs = exercises.map((e) => e.slug);
    expect(slugs).not.toContain('barbell-squat');
    expect(slugs).toContain('bodyweight-squat');
  });

  it('applies dumbbell substitutions', () => {
    const exercises = generator.getExercisesForDay('FULL_BODY', 'DUMBBELLS', 'INTERMEDIATE');
    const slugs = exercises.map((e) => e.slug);
    expect(slugs).not.toContain('barbell-squat');
    expect(slugs).toContain('dumbbell-goblet-squat');
  });

  it('returns only compound exercises for beginners', () => {
    const exercises = generator.getExercisesForDay('FULL_BODY', 'BARBELL', 'BEGINNER');
    expect(exercises.every((e) => e.type === 'compound')).toBe(true);
    expect(exercises.length).toBeLessThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// getExerciseOrder
// ---------------------------------------------------------------------------

describe('WorkoutGenerator.getExerciseOrder', () => {
  it('puts compound exercises before isolation exercises', () => {
    const exercises = generator.getExercisesForDay('FULL_BODY', 'BARBELL', 'INTERMEDIATE');
    const firstIsolationIndex = exercises.findIndex((e) => e.type === 'isolation');
    const lastCompoundIndex = exercises.reduceRight(
      (acc, e, idx) => (e.type === 'compound' && acc === -1 ? idx : acc),
      -1,
    );
    if (firstIsolationIndex !== -1 && lastCompoundIndex !== -1) {
      expect(lastCompoundIndex).toBeLessThan(firstIsolationIndex);
    }
  });

  it('ordering is stable (calling twice returns same order)', () => {
    const a = generator.getExercisesForDay('PUSH', 'BARBELL', 'INTERMEDIATE');
    const b = generator.getExercisesForDay('PUSH', 'BARBELL', 'INTERMEDIATE');
    expect(a.map((e) => e.slug)).toEqual(b.map((e) => e.slug));
  });
});

// ---------------------------------------------------------------------------
// generateProgram
// ---------------------------------------------------------------------------

describe('WorkoutGenerator.generateProgram', () => {
  it('generates a program with correct daysPerWeek', () => {
    const program = generator.generateProgram({
      goal: 'BUILD_MUSCLE',
      experience: 'INTERMEDIATE',
      daysPerWeek: 4,
      equipment: 'BARBELL',
    });
    expect(program.daysPerWeek).toBe(4);
    expect(program.weeks[0].days.length).toBe(4);
  });

  it('generates 8 weeks for beginners', () => {
    const program = generator.generateProgram({
      goal: 'BUILD_MUSCLE',
      experience: 'BEGINNER',
      daysPerWeek: 3,
      equipment: 'BARBELL',
    });
    expect(program.weeksTotal).toBe(8);
    expect(program.weeks.length).toBe(8);
  });

  it('generates 10 weeks for intermediate', () => {
    const program = generator.generateProgram({
      goal: 'BUILD_MUSCLE',
      experience: 'INTERMEDIATE',
      daysPerWeek: 4,
      equipment: 'BARBELL',
    });
    expect(program.weeksTotal).toBe(10);
  });

  it('generates 12 weeks for advanced', () => {
    const program = generator.generateProgram({
      goal: 'STRENGTH',
      experience: 'ADVANCED',
      daysPerWeek: 5,
      equipment: 'BARBELL',
    });
    expect(program.weeksTotal).toBe(12);
  });

  it('includes setRepScheme and restTimeSecs in program', () => {
    const program = generator.generateProgram({
      goal: 'STRENGTH',
      experience: 'INTERMEDIATE',
      daysPerWeek: 3,
      equipment: 'BARBELL',
    });
    expect(program.setRepScheme).toBeDefined();
    expect(program.restTimeSecs).toBeGreaterThan(0);
  });

  it('each day has exercises', () => {
    const program = generator.generateProgram({
      goal: 'LOSE_FAT',
      experience: 'INTERMEDIATE',
      daysPerWeek: 3,
      equipment: 'DUMBBELLS',
    });
    program.weeks[0].days.forEach((day) => {
      expect(day.exercises.length).toBeGreaterThan(0);
    });
  });

  it('week numbers are sequential', () => {
    const program = generator.generateProgram({
      goal: 'BUILD_MUSCLE',
      experience: 'INTERMEDIATE',
      daysPerWeek: 4,
      equipment: 'BARBELL',
    });
    program.weeks.forEach((week, idx) => {
      expect(week.weekNumber).toBe(idx + 1);
    });
  });
});

// ---------------------------------------------------------------------------
// ProgressionEngine.suggestNextWeight
// ---------------------------------------------------------------------------

describe('ProgressionEngine.suggestNextWeight', () => {
  it('suggests increase when reps hit top of range', () => {
    const result = progression.suggestNextWeight({
      previousWeight: 100,
      previousReps: 12,
      targetRepsMin: 8,
      targetRepsMax: 12,
      goalType: 'BUILD_MUSCLE',
      experienceLevel: 'INTERMEDIATE',
    });
    expect(result.action).toBe('increase');
    expect(result.suggestedWeight).toBeGreaterThan(100);
  });

  it('suggests maintain when reps are within range', () => {
    const result = progression.suggestNextWeight({
      previousWeight: 100,
      previousReps: 10,
      targetRepsMin: 8,
      targetRepsMax: 12,
      goalType: 'BUILD_MUSCLE',
      experienceLevel: 'INTERMEDIATE',
    });
    expect(result.action).toBe('maintain');
    expect(result.suggestedWeight).toBe(100);
  });

  it('suggests decrease when reps fall below minimum', () => {
    const result = progression.suggestNextWeight({
      previousWeight: 100,
      previousReps: 5,
      targetRepsMin: 8,
      targetRepsMax: 12,
      goalType: 'BUILD_MUSCLE',
      experienceLevel: 'INTERMEDIATE',
    });
    expect(result.action).toBe('decrease');
    expect(result.suggestedWeight).toBeLessThan(100);
  });

  it('suggested weight is non-negative', () => {
    const result = progression.suggestNextWeight({
      previousWeight: 2.5,
      previousReps: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
      goalType: 'BUILD_MUSCLE',
      experienceLevel: 'BEGINNER',
    });
    expect(result.suggestedWeight).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// ProgressionEngine.checkProgressionReadiness
// ---------------------------------------------------------------------------

describe('ProgressionEngine.checkProgressionReadiness', () => {
  it('returns true when all sets hit targetMax', () => {
    const ready = progression.checkProgressionReadiness([
      { reps: 12, targetMin: 8, targetMax: 12 },
      { reps: 12, targetMin: 8, targetMax: 12 },
      { reps: 13, targetMin: 8, targetMax: 12 },
    ]);
    expect(ready).toBe(true);
  });

  it('returns false when any set is below targetMax', () => {
    const ready = progression.checkProgressionReadiness([
      { reps: 12, targetMin: 8, targetMax: 12 },
      { reps: 10, targetMin: 8, targetMax: 12 },
    ]);
    expect(ready).toBe(false);
  });

  it('returns false for empty set logs', () => {
    expect(progression.checkProgressionReadiness([])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ProgressionEngine.getWeeklyProgressionCap
// ---------------------------------------------------------------------------

describe('ProgressionEngine.getWeeklyProgressionCap', () => {
  it('BEGINNER cap is 5%', () => {
    expect(progression.getWeeklyProgressionCap('BEGINNER')).toBe(0.05);
  });

  it('INTERMEDIATE cap is 2.5%', () => {
    expect(progression.getWeeklyProgressionCap('INTERMEDIATE')).toBe(0.025);
  });

  it('ADVANCED cap is 1%', () => {
    expect(progression.getWeeklyProgressionCap('ADVANCED')).toBe(0.01);
  });

  it('falls back to INTERMEDIATE for unknown level', () => {
    expect(progression.getWeeklyProgressionCap('UNKNOWN')).toBe(0.025);
  });
});

// ---------------------------------------------------------------------------
// ProgressionEngine.calculateProgressionIncrease
// ---------------------------------------------------------------------------

describe('ProgressionEngine.calculateProgressionIncrease', () => {
  it('beginner strength increment is 2.5kg for low weight', () => {
    // At 50kg with 5% cap: cap = 2.5kg, increment = 2.5kg → min(2.5, 2.5) = 2.5
    const inc = progression.calculateProgressionIncrease(50, 'BEGINNER', 'STRENGTH');
    expect(inc).toBeCloseTo(2.5, 1);
  });

  it('intermediate strength increment is capped by weekly cap for heavy weights', () => {
    // At 200kg intermediate: cap = 200 * 0.025 = 5kg, STRENGTH increment = 5kg → 5
    const inc = progression.calculateProgressionIncrease(200, 'INTERMEDIATE', 'STRENGTH');
    expect(inc).toBeCloseTo(5, 1);
  });

  it('increment is always positive', () => {
    const inc = progression.calculateProgressionIncrease(100, 'ADVANCED', 'BUILD_MUSCLE');
    expect(inc).toBeGreaterThan(0);
  });
});
