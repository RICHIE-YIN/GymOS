export interface ProgressionSuggestion {
  suggestedWeight: number;
  action: 'increase' | 'maintain' | 'decrease';
  rationale: string;
}

// How much to increase weight (in kg) per experience level and goal
const PROGRESSION_INCREMENTS: Record<string, Record<string, number>> = {
  BEGINNER: {
    STRENGTH: 2.5,
    BUILD_MUSCLE: 2.5,
    LOSE_FAT: 2.5,
    ENDURANCE: 2.5,
    MAINTENANCE: 2.5,
    RECOMPOSITION: 2.5,
  },
  INTERMEDIATE: {
    STRENGTH: 5,
    BUILD_MUSCLE: 2.5,
    LOSE_FAT: 2.5,
    ENDURANCE: 2.5,
    MAINTENANCE: 2.5,
    RECOMPOSITION: 2.5,
  },
  ADVANCED: {
    STRENGTH: 2.5,
    BUILD_MUSCLE: 1.25,
    LOSE_FAT: 1.25,
    ENDURANCE: 1.25,
    MAINTENANCE: 1.25,
    RECOMPOSITION: 1.25,
  },
};

// Weekly progression caps by experience (percentage of current weight)
const WEEKLY_PROGRESSION_CAPS: Record<string, number> = {
  BEGINNER: 0.05, // 5%
  INTERMEDIATE: 0.025, // 2.5%
  ADVANCED: 0.01, // 1%
};

export class ProgressionEngine {
  /**
   * Suggest the next working weight for an exercise based on previous performance.
   *
   * Decision logic:
   *  - All sets hit the top of the rep range → increase weight
   *  - Performance declined (reps dropped below targetMin on any set) → decrease weight
   *  - Otherwise (within range or inconsistent) → maintain weight
   */
  suggestNextWeight(params: {
    previousWeight: number;
    previousReps: number;
    targetRepsMin: number;
    targetRepsMax: number;
    goalType: string;
    experienceLevel: string;
  }): ProgressionSuggestion {
    const { previousWeight, previousReps, targetRepsMin, targetRepsMax, goalType, experienceLevel } =
      params;

    const hitTopOfRange = previousReps >= targetRepsMax;
    const performanceDeclined = previousReps < targetRepsMin;

    if (hitTopOfRange) {
      const increase = this.calculateProgressionIncrease(previousWeight, experienceLevel, goalType);
      return {
        suggestedWeight: previousWeight + increase,
        action: 'increase',
        rationale: `Hit the top of the rep range (${targetRepsMax}). Adding ${increase}kg.`,
      };
    }

    if (performanceDeclined) {
      // Reduce by the standard increment amount (small deload)
      const decrease = this.calculateProgressionIncrease(previousWeight, experienceLevel, goalType);
      const newWeight = Math.max(0, previousWeight - decrease);
      return {
        suggestedWeight: newWeight,
        action: 'decrease',
        rationale: `Performance declined below target min (${targetRepsMin} reps). Reducing weight by ${decrease}kg.`,
      };
    }

    return {
      suggestedWeight: previousWeight,
      action: 'maintain',
      rationale: `Performance within target range (${targetRepsMin}-${targetRepsMax} reps). Maintaining weight.`,
    };
  }

  /**
   * Calculate the absolute weight increase (in kg) appropriate for the given
   * experience level and goal type.
   */
  calculateProgressionIncrease(
    weight: number,
    experienceLevel: string,
    goalType: string,
  ): number {
    const normalizedExperience = experienceLevel.toUpperCase();
    const normalizedGoal = goalType.toUpperCase();

    const levelIncrements =
      PROGRESSION_INCREMENTS[normalizedExperience] ?? PROGRESSION_INCREMENTS['INTERMEDIATE'];
    const increment = levelIncrements[normalizedGoal] ?? levelIncrements['BUILD_MUSCLE'] ?? 2.5;

    // Cap the increment at the weekly progression cap to avoid jumps that are too large
    const cap = this.getWeeklyProgressionCap(experienceLevel);
    const maxIncrease = weight * cap;

    return Math.min(increment, maxIncrease > 0 ? maxIncrease : increment);
  }

  /**
   * Check whether an athlete is ready to progress (all sets hit the top of their
   * rep range).
   *
   * @param setLogs - Array of per-set results. Each entry contains the actual
   *   reps performed and the target rep window for that set.
   * @returns `true` only when every set met or exceeded `targetMax`.
   */
  checkProgressionReadiness(
    setLogs: { reps: number; targetMin: number; targetMax: number }[],
  ): boolean {
    if (setLogs.length === 0) return false;
    return setLogs.every((set) => set.reps >= set.targetMax);
  }

  /**
   * Return the maximum allowed weekly weight increase as a fraction of current
   * load (e.g. 0.05 = 5%).
   */
  getWeeklyProgressionCap(experienceLevel: string): number {
    const normalized = experienceLevel.toUpperCase();
    return WEEKLY_PROGRESSION_CAPS[normalized] ?? WEEKLY_PROGRESSION_CAPS['INTERMEDIATE'];
  }
}
