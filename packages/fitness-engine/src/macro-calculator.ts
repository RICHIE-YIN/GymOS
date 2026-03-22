export interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmr: number;
  tdee: number;
}

type Formula = 'mifflin-st-jeor' | 'harris-benedict' | 'katch-mcardle';

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};

const CALORIE_ADJUSTMENTS: Record<string, number> = {
  LOSE_FAT: -500,
  BUILD_MUSCLE: 300,
  RECOMPOSITION: 0,
  MAINTENANCE: 0,
  STRENGTH: 200,
  ENDURANCE: 100,
};

// Protein targets in g/kg body weight
const PROTEIN_TARGETS: Record<string, number> = {
  LOSE_FAT: 2.2,
  BUILD_MUSCLE: 2.0,
  RECOMPOSITION: 2.4,
  STRENGTH: 1.8,
  MAINTENANCE: 1.6,
  ENDURANCE: 1.6,
};

// Beginners use a slightly lower multiplier
const BEGINNER_PROTEIN_REDUCTION = 0.8; // 80% of the target

export class MacroCalculator {
  /**
   * Calculate Basal Metabolic Rate (BMR) in kcal/day.
   * Default formula: Mifflin-St Jeor
   */
  calculateBMR(params: {
    weight: number;
    height: number;
    age: number;
    gender: string;
    formula?: Formula;
  }): number {
    const { weight, height, age, gender, formula = 'mifflin-st-jeor' } = params;
    const isMale = gender.toLowerCase() === 'male' || gender.toLowerCase() === 'm';

    switch (formula) {
      case 'mifflin-st-jeor': {
        // weight in kg, height in cm
        const base = 10 * weight + 6.25 * height - 5 * age;
        return isMale ? base + 5 : base - 161;
      }

      case 'harris-benedict': {
        if (isMale) {
          return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
        } else {
          return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
        }
      }

      case 'katch-mcardle': {
        // Katch-McArdle requires lean body mass; without it we cannot compute.
        // This formula variant is included for completeness but requires leanMass.
        // Falls back to Mifflin-St Jeor when lean mass is unavailable.
        const base = 10 * weight + 6.25 * height - 5 * age;
        return isMale ? base + 5 : base - 161;
      }

      default:
        throw new Error(`Unknown formula: ${formula as string}`);
    }
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE) in kcal/day.
   */
  calculateTDEE(bmr: number, activityLevel: string): number {
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel.toUpperCase()];
    if (multiplier === undefined) {
      throw new Error(`Unknown activity level: ${activityLevel}`);
    }
    return Math.round(bmr * multiplier);
  }

  /**
   * Calculate the calorie target for a given goal type.
   */
  calculateCalorieTarget(tdee: number, goalType: string): number {
    const adjustment = CALORIE_ADJUSTMENTS[goalType.toUpperCase()];
    if (adjustment === undefined) {
      throw new Error(`Unknown goal type: ${goalType}`);
    }
    return Math.round(tdee + adjustment);
  }

  /**
   * Calculate daily protein target in grams.
   * Beginners receive a slightly lower target (80% of the goal-specific rate).
   */
  calculateProteinTarget(
    weightKg: number,
    goalType: string,
    experienceLevel: string,
  ): number {
    const rate = PROTEIN_TARGETS[goalType.toUpperCase()];
    if (rate === undefined) {
      throw new Error(`Unknown goal type: ${goalType}`);
    }
    const isBeginnerLevel = experienceLevel.toUpperCase() === 'BEGINNER';
    const effectiveRate = isBeginnerLevel ? rate * BEGINNER_PROTEIN_REDUCTION : rate;
    return Math.round(weightKg * effectiveRate);
  }

  /**
   * Calculate the minimum daily fat intake in grams (0.8 g/kg body weight).
   */
  calculateFatMinimum(weightKg: number): number {
    return Math.round(weightKg * 0.8);
  }

  /**
   * Calculate full macro breakdown.
   *
   * Priority order:
   *  1. Protein calories (4 kcal/g)
   *  2. Fat minimum calories (9 kcal/g)
   *  3. Remaining calories filled by carbohydrates (4 kcal/g)
   */
  calculateMacros(params: {
    weight: number;
    height: number;
    age: number;
    gender: string;
    activityLevel: string;
    goalType: string;
    experienceLevel: string;
    formula?: Formula;
  }): MacroResult {
    const { weight, height, age, gender, activityLevel, goalType, experienceLevel, formula } =
      params;

    const bmr = this.calculateBMR({ weight, height, age, gender, formula });
    const tdee = this.calculateTDEE(bmr, activityLevel);
    const calories = this.calculateCalorieTarget(tdee, goalType);

    const protein = this.calculateProteinTarget(weight, goalType, experienceLevel);
    const fat = this.calculateFatMinimum(weight);

    const proteinCalories = protein * 4;
    const fatCalories = fat * 9;
    const carbCalories = Math.max(0, calories - proteinCalories - fatCalories);
    const carbs = Math.round(carbCalories / 4);

    return {
      calories,
      protein,
      carbs,
      fat,
      bmr: Math.round(bmr),
      tdee,
    };
  }

  /**
   * Convert weight between kg and lbs.
   */
  convertWeight(value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number {
    if (from === to) return value;
    if (from === 'lbs' && to === 'kg') {
      return value / 2.20462;
    }
    // from kg to lbs
    return value * 2.20462;
  }

  /**
   * Convert height from centimeters to feet and inches.
   */
  convertHeight(cm: number): { feet: number; inches: number } {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  }

  /**
   * Convert height from feet + inches to centimeters.
   */
  convertHeightToCm(feet: number, inches: number): number {
    const totalInches = feet * 12 + inches;
    return totalInches * 2.54;
  }
}
