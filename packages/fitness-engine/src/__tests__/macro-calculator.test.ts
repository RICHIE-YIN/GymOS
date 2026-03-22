import { MacroCalculator } from '../macro-calculator';

const calc = new MacroCalculator();

// ---------------------------------------------------------------------------
// BMR calculations
// ---------------------------------------------------------------------------

describe('MacroCalculator.calculateBMR', () => {
  describe('Mifflin-St Jeor (default)', () => {
    it('calculates BMR for a male', () => {
      // weight=80kg, height=180cm, age=30, male
      // (10*80) + (6.25*180) - (5*30) + 5 = 800 + 1125 - 150 + 5 = 1780
      const bmr = calc.calculateBMR({ weight: 80, height: 180, age: 30, gender: 'male' });
      expect(bmr).toBeCloseTo(1780, 0);
    });

    it('calculates BMR for a female', () => {
      // weight=65kg, height=165cm, age=25, female
      // (10*65) + (6.25*165) - (5*25) - 161 = 650 + 1031.25 - 125 - 161 = 1395.25
      const bmr = calc.calculateBMR({ weight: 65, height: 165, age: 25, gender: 'female' });
      expect(bmr).toBeCloseTo(1395.25, 1);
    });

    it('accepts gender shorthand "m"', () => {
      const bmr = calc.calculateBMR({ weight: 80, height: 180, age: 30, gender: 'm' });
      expect(bmr).toBeCloseTo(1780, 0);
    });

    it('accepts formula: mifflin-st-jeor explicitly', () => {
      const bmr = calc.calculateBMR({
        weight: 80,
        height: 180,
        age: 30,
        gender: 'male',
        formula: 'mifflin-st-jeor',
      });
      expect(bmr).toBeCloseTo(1780, 0);
    });
  });

  describe('Harris-Benedict', () => {
    it('calculates BMR for a male', () => {
      // 88.362 + (13.397*80) + (4.799*180) - (5.677*30)
      // = 88.362 + 1071.76 + 863.82 - 170.31 = 1853.632
      const bmr = calc.calculateBMR({
        weight: 80,
        height: 180,
        age: 30,
        gender: 'male',
        formula: 'harris-benedict',
      });
      expect(bmr).toBeCloseTo(1853.632, 1);
    });

    it('calculates BMR for a female', () => {
      // 447.593 + (9.247*65) + (3.098*165) - (4.330*25)
      // = 447.593 + 601.055 + 511.17 - 108.25 = 1451.568
      const bmr = calc.calculateBMR({
        weight: 65,
        height: 165,
        age: 25,
        gender: 'female',
        formula: 'harris-benedict',
      });
      expect(bmr).toBeCloseTo(1451.568, 1);
    });
  });

  describe('Katch-McArdle', () => {
    it('falls back to Mifflin-St Jeor for male when lean mass unavailable', () => {
      const mifflinBmr = calc.calculateBMR({ weight: 80, height: 180, age: 30, gender: 'male' });
      const katchBmr = calc.calculateBMR({
        weight: 80,
        height: 180,
        age: 30,
        gender: 'male',
        formula: 'katch-mcardle',
      });
      expect(katchBmr).toBeCloseTo(mifflinBmr, 5);
    });
  });
});

// ---------------------------------------------------------------------------
// TDEE calculations
// ---------------------------------------------------------------------------

describe('MacroCalculator.calculateTDEE', () => {
  const bmr = 1780;

  it.each([
    ['SEDENTARY', 1.2, Math.round(1780 * 1.2)],
    ['LIGHTLY_ACTIVE', 1.375, Math.round(1780 * 1.375)],
    ['MODERATELY_ACTIVE', 1.55, Math.round(1780 * 1.55)],
    ['VERY_ACTIVE', 1.725, Math.round(1780 * 1.725)],
    ['EXTRA_ACTIVE', 1.9, Math.round(1780 * 1.9)],
  ])('computes TDEE for %s (multiplier %f)', (level, _multiplier, expected) => {
    expect(calc.calculateTDEE(bmr, level)).toBe(expected);
  });

  it('throws on unknown activity level', () => {
    expect(() => calc.calculateTDEE(bmr, 'UNKNOWN')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Calorie target calculations
// ---------------------------------------------------------------------------

describe('MacroCalculator.calculateCalorieTarget', () => {
  const tdee = 2500;

  it.each([
    ['LOSE_FAT', 2000],
    ['BUILD_MUSCLE', 2800],
    ['RECOMPOSITION', 2500],
    ['MAINTENANCE', 2500],
    ['STRENGTH', 2700],
    ['ENDURANCE', 2600],
  ])('goal %s → %i kcal', (goal, expected) => {
    expect(calc.calculateCalorieTarget(tdee, goal)).toBe(expected);
  });

  it('throws on unknown goal type', () => {
    expect(() => calc.calculateCalorieTarget(tdee, 'UNKNOWN')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Protein target calculations
// ---------------------------------------------------------------------------

describe('MacroCalculator.calculateProteinTarget', () => {
  const weight = 80; // kg

  it.each([
    ['LOSE_FAT', 'INTERMEDIATE', Math.round(80 * 2.2)],
    ['BUILD_MUSCLE', 'INTERMEDIATE', Math.round(80 * 2.0)],
    ['RECOMPOSITION', 'INTERMEDIATE', Math.round(80 * 2.4)],
    ['STRENGTH', 'INTERMEDIATE', Math.round(80 * 1.8)],
    ['MAINTENANCE', 'INTERMEDIATE', Math.round(80 * 1.6)],
    ['ENDURANCE', 'INTERMEDIATE', Math.round(80 * 1.6)],
  ])('%s / intermediate → %ig protein', (goal, experience, expected) => {
    expect(calc.calculateProteinTarget(weight, goal, experience)).toBe(expected);
  });

  it('applies 80% reduction for beginners', () => {
    // BUILD_MUSCLE beginner: 80 * 2.0 * 0.8 = 128
    expect(calc.calculateProteinTarget(weight, 'BUILD_MUSCLE', 'BEGINNER')).toBe(
      Math.round(80 * 2.0 * 0.8),
    );
  });

  it('throws on unknown goal type', () => {
    expect(() => calc.calculateProteinTarget(weight, 'UNKNOWN', 'INTERMEDIATE')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Fat minimum
// ---------------------------------------------------------------------------

describe('MacroCalculator.calculateFatMinimum', () => {
  it('returns 0.8g per kg body weight', () => {
    expect(calc.calculateFatMinimum(80)).toBe(Math.round(80 * 0.8));
    expect(calc.calculateFatMinimum(65)).toBe(Math.round(65 * 0.8));
  });
});

// ---------------------------------------------------------------------------
// Full macro breakdown
// ---------------------------------------------------------------------------

describe('MacroCalculator.calculateMacros', () => {
  const baseParams = {
    weight: 80,
    height: 180,
    age: 30,
    gender: 'male',
    activityLevel: 'MODERATELY_ACTIVE',
    goalType: 'BUILD_MUSCLE',
    experienceLevel: 'INTERMEDIATE',
  };

  it('returns an object with all required fields', () => {
    const result = calc.calculateMacros(baseParams);
    expect(result).toHaveProperty('calories');
    expect(result).toHaveProperty('protein');
    expect(result).toHaveProperty('carbs');
    expect(result).toHaveProperty('fat');
    expect(result).toHaveProperty('bmr');
    expect(result).toHaveProperty('tdee');
  });

  it('macro calories sum is consistent with target calories', () => {
    const result = calc.calculateMacros(baseParams);
    const macroCalories = result.protein * 4 + result.fat * 9 + result.carbs * 4;
    // Allow for rounding differences of up to 9 kcal (max rounding from integer macros)
    expect(Math.abs(macroCalories - result.calories)).toBeLessThanOrEqual(9);
  });

  it('carbs are non-negative', () => {
    const result = calc.calculateMacros(baseParams);
    expect(result.carbs).toBeGreaterThanOrEqual(0);
  });

  it('bmr is less than tdee', () => {
    const result = calc.calculateMacros(baseParams);
    expect(result.bmr).toBeLessThan(result.tdee);
  });

  it('works for LOSE_FAT goal', () => {
    const result = calc.calculateMacros({ ...baseParams, goalType: 'LOSE_FAT' });
    expect(result.calories).toBeLessThan(result.tdee);
  });

  it('works for female', () => {
    const result = calc.calculateMacros({ ...baseParams, gender: 'female', weight: 65, height: 165, age: 25 });
    expect(result.protein).toBeGreaterThan(0);
    expect(result.bmr).toBeGreaterThan(0);
  });

  it('all macros are positive integers', () => {
    const result = calc.calculateMacros(baseParams);
    expect(Number.isInteger(result.protein)).toBe(true);
    expect(Number.isInteger(result.fat)).toBe(true);
    expect(Number.isInteger(result.carbs)).toBe(true);
    expect(result.protein).toBeGreaterThan(0);
    expect(result.fat).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Unit conversions
// ---------------------------------------------------------------------------

describe('MacroCalculator.convertWeight', () => {
  it('converts kg to lbs', () => {
    expect(calc.convertWeight(80, 'kg', 'lbs')).toBeCloseTo(176.37, 1);
  });

  it('converts lbs to kg', () => {
    expect(calc.convertWeight(176.37, 'lbs', 'kg')).toBeCloseTo(80, 1);
  });

  it('returns same value when from === to', () => {
    expect(calc.convertWeight(80, 'kg', 'kg')).toBe(80);
    expect(calc.convertWeight(176, 'lbs', 'lbs')).toBe(176);
  });
});

describe('MacroCalculator.convertHeight', () => {
  it('converts 180cm to 5ft 11in', () => {
    const result = calc.convertHeight(180);
    expect(result.feet).toBe(5);
    expect(result.inches).toBe(11);
  });

  it('converts 152.4cm (exactly 5 feet) correctly', () => {
    const result = calc.convertHeight(152.4);
    expect(result.feet).toBe(5);
    expect(result.inches).toBe(0);
  });
});

describe('MacroCalculator.convertHeightToCm', () => {
  it('converts 5ft 11in to ~180cm', () => {
    expect(calc.convertHeightToCm(5, 11)).toBeCloseTo(180.34, 1);
  });

  it('converts 6ft 0in to ~182.88cm', () => {
    expect(calc.convertHeightToCm(6, 0)).toBeCloseTo(182.88, 1);
  });

  it('round-trips with convertHeight', () => {
    const originalCm = 175;
    const { feet, inches } = calc.convertHeight(originalCm);
    const backToCm = calc.convertHeightToCm(feet, inches);
    // Allow ±1cm rounding tolerance due to integer inches
    expect(Math.abs(backToCm - originalCm)).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('MacroCalculator edge cases', () => {
  it('handles very low body weight without negative macros', () => {
    const result = calc.calculateMacros({
      weight: 40,
      height: 150,
      age: 20,
      gender: 'female',
      activityLevel: 'SEDENTARY',
      goalType: 'LOSE_FAT',
      experienceLevel: 'BEGINNER',
    });
    expect(result.carbs).toBeGreaterThanOrEqual(0);
    expect(result.protein).toBeGreaterThan(0);
    expect(result.fat).toBeGreaterThan(0);
  });

  it('handles very high body weight', () => {
    const result = calc.calculateMacros({
      weight: 150,
      height: 190,
      age: 40,
      gender: 'male',
      activityLevel: 'EXTRA_ACTIVE',
      goalType: 'BUILD_MUSCLE',
      experienceLevel: 'ADVANCED',
    });
    expect(result.calories).toBeGreaterThan(3000);
    expect(result.protein).toBeGreaterThan(200);
  });
});
