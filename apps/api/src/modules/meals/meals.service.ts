import prisma from '../../lib/prisma';
import { NotFoundError, AppError } from '../../middleware/error.middleware';
import { Prisma } from '@prisma/client';

export interface MealFilters {
  mealType?: string;
  maxCalories?: number;
  minProtein?: number;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export async function browseMeals(filters: MealFilters) {
  const { mealType, maxCalories, minProtein, search, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.MealWhereInput = {
    ...(mealType && { mealType }),
    ...(maxCalories && { calories: { lte: maxCalories } }),
    ...(minProtein && { protein: { gte: minProtein } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [meals, total] = await Promise.all([
    prisma.meal.findMany({
      where,
      skip,
      take: limit,
      include: { ingredients: true },
      orderBy: { title: 'asc' },
    }),
    prisma.meal.count({ where }),
  ]);

  return {
    meals,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getMealById(id: string) {
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: { ingredients: true },
  });
  if (!meal) throw new NotFoundError('Meal not found.');
  return meal;
}

export async function getTodayMealPlan(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let day = await prisma.userMealPlanDay.findUnique({
    where: { userId_date: { userId, date: today } },
    include: {
      items: {
        include: { meal: { include: { ingredients: true } } },
        orderBy: { mealSlot: 'asc' },
      },
    },
  });

  if (!day) {
    day = await prisma.userMealPlanDay.create({
      data: { userId, date: today },
      include: {
        items: {
          include: { meal: { include: { ingredients: true } } },
        },
      },
    });
  }

  return day;
}

export async function addMealToPlan(userId: string, data: { mealId: string; mealSlot: string; date?: string; customOverrides?: Record<string, unknown> }) {
  const { mealId, mealSlot, customOverrides = {} } = data;
  const targetDate = data.date ? new Date(data.date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const meal = await prisma.meal.findUnique({ where: { id: mealId } });
  if (!meal) throw new NotFoundError('Meal not found.');

  const day = await prisma.userMealPlanDay.upsert({
    where: { userId_date: { userId, date: targetDate } },
    create: { userId, date: targetDate },
    update: {},
  });

  const item = await prisma.userMealPlanItem.create({
    data: { dayId: day.id, mealId, mealSlot, customOverrides },
    include: { meal: { include: { ingredients: true } } },
  });

  // Update day totals
  await recalculateDayTotals(day.id);

  return item;
}

export async function removeMealFromPlan(userId: string, itemId: string) {
  const item = await prisma.userMealPlanItem.findUnique({
    where: { id: itemId },
    include: { day: true },
  });

  if (!item) throw new NotFoundError('Meal plan item not found.');
  if (item.day.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');

  await prisma.userMealPlanItem.delete({ where: { id: itemId } });
  await recalculateDayTotals(item.dayId);
}

async function recalculateDayTotals(dayId: string) {
  const items = await prisma.userMealPlanItem.findMany({
    where: { dayId },
    include: { meal: true },
  });

  const totals = items.reduce(
    (acc, item) => ({
      totalCalories: acc.totalCalories + item.meal.calories,
      totalProtein: acc.totalProtein + item.meal.protein,
      totalCarbs: acc.totalCarbs + item.meal.carbs,
      totalFat: acc.totalFat + item.meal.fat,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
  );

  await prisma.userMealPlanDay.update({ where: { id: dayId }, data: totals });
}

export async function getSavedMeals(userId: string) {
  return prisma.meal.findMany({
    where: { createdByUserId: userId },
    include: { ingredients: true },
  });
}

export async function saveMeal(userId: string, mealId: string) {
  const meal = await prisma.meal.findUnique({ where: { id: mealId } });
  if (!meal) throw new NotFoundError('Meal not found.');

  // For now, saving a meal duplicates it as user-owned. Could be a favorites table.
  return prisma.meal.create({
    data: {
      title: meal.title,
      mealType: meal.mealType,
      description: meal.description,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      prepTimeMinutes: meal.prepTimeMinutes,
      cookTimeMinutes: meal.cookTimeMinutes,
      servings: meal.servings,
      instructions: meal.instructions as Prisma.InputJsonValue,
      tags: meal.tags as Prisma.InputJsonValue,
      createdByType: 'USER',
      createdByUserId: userId,
    },
  });
}
