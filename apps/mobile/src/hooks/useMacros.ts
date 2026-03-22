import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiGet, apiPost } from '../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────
export interface MacroTargets {
  calories: number;
  protein: number;   // grams
  carbs: number;     // grams
  fat: number;       // grams
}

export interface MacroLog {
  date: string;
  consumed: MacroTargets;
  targets: MacroTargets;
  meals: MealLog[];
}

export interface MealLog {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time?: string;
  macros: MacroTargets;
  foods: FoodItem[];
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  macros: MacroTargets;
}

export interface MealPlan {
  id: string;
  name: string;
  meals: PlannedMeal[];
  totalMacros: MacroTargets;
}

export interface PlannedMeal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  macros: MacroTargets;
  ingredients: Ingredient[];
  prepTime: number;
  cookTime: number;
  instructions: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  macros: MacroTargets;
  substitutes?: string[];
}

// ── Query keys ─────────────────────────────────────────────────────────────
export const macroKeys = {
  all: ['macros'] as const,
  log: (date: string) => [...macroKeys.all, 'log', date] as const,
  targets: () => [...macroKeys.all, 'targets'] as const,
  mealPlan: (date: string) => [...macroKeys.all, 'meal-plan', date] as const,
  meal: (id: string) => [...macroKeys.all, 'meal', id] as const,
  history: (days: number) => [...macroKeys.all, 'history', days] as const,
};

// ── Hook ──────────────────────────────────────────────────────────────────
export function useMacros(date: Date = new Date()) {
  const qc = useQueryClient();
  const dateStr = format(date, 'yyyy-MM-dd');

  const logQuery = useQuery({
    queryKey: macroKeys.log(dateStr),
    queryFn: () => apiGet<MacroLog>(`/nutrition/log/${dateStr}`),
    staleTime: 1 * 60 * 1000,
  });

  const targetsQuery = useQuery({
    queryKey: macroKeys.targets(),
    queryFn: () => apiGet<MacroTargets>('/nutrition/targets'),
  });

  const mealPlanQuery = useQuery({
    queryKey: macroKeys.mealPlan(dateStr),
    queryFn: () => apiGet<MealPlan>(`/nutrition/meal-plan/${dateStr}`),
  });

  const logFoodMutation = useMutation({
    mutationFn: (data: { mealId: string; food: Omit<FoodItem, 'id'> }) =>
      apiPost('/nutrition/log', { date: dateStr, ...data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: macroKeys.log(dateStr) });
    },
  });

  const percentages = logQuery.data
    ? {
        calories: Math.min(
          (logQuery.data.consumed.calories / (logQuery.data.targets.calories || 1)) * 100,
          100,
        ),
        protein: Math.min(
          (logQuery.data.consumed.protein / (logQuery.data.targets.protein || 1)) * 100,
          100,
        ),
        carbs: Math.min(
          (logQuery.data.consumed.carbs / (logQuery.data.targets.carbs || 1)) * 100,
          100,
        ),
        fat: Math.min(
          (logQuery.data.consumed.fat / (logQuery.data.targets.fat || 1)) * 100,
          100,
        ),
      }
    : null;

  return {
    log: logQuery.data,
    isLoadingLog: logQuery.isLoading,
    targets: targetsQuery.data,
    mealPlan: mealPlanQuery.data,
    percentages,
    logFood: logFoodMutation.mutateAsync,
    isLoggingFood: logFoodMutation.isPending,
    refetch: logQuery.refetch,
  };
}

export function useMealDetail(mealId: string) {
  return useQuery({
    queryKey: macroKeys.meal(mealId),
    queryFn: () => apiGet<PlannedMeal>(`/nutrition/meals/${mealId}`),
    enabled: !!mealId,
  });
}

export function useMacroHistory(days = 30) {
  return useQuery({
    queryKey: macroKeys.history(days),
    queryFn: () => apiGet<MacroLog[]>(`/nutrition/history?days=${days}`),
    staleTime: 5 * 60 * 1000,
  });
}
