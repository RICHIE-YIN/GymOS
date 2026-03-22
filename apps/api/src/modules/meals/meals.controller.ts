import { Request, Response, NextFunction } from 'express';
import * as MealsService from './meals.service';
import { AppError } from '../../middleware/error.middleware';

export async function getTodayMealPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const day = await MealsService.getTodayMealPlan(req.user.userId);
    res.json({ success: true, data: { day } });
  } catch (err) {
    next(err);
  }
}

export async function browseMeals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { mealType, maxCalories, minProtein, search, page, limit } = req.query as Record<string, string>;
    const result = await MealsService.browseMeals({
      mealType,
      maxCalories: maxCalories ? parseInt(maxCalories) : undefined,
      minProtein: minProtein ? parseInt(minProtein) : undefined,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? Math.min(parseInt(limit), 100) : 20,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meal = await MealsService.getMealById(req.params.id);
    res.json({ success: true, data: { meal } });
  } catch (err) {
    next(err);
  }
}

export async function addMealToPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const item = await MealsService.addMealToPlan(req.user.userId, req.body);
    res.status(201).json({ success: true, data: { item } });
  } catch (err) {
    next(err);
  }
}

export async function removeMealFromPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    await MealsService.removeMealFromPlan(req.user.userId, req.params.itemId);
    res.json({ success: true, data: { message: 'Meal removed from plan.' } });
  } catch (err) {
    next(err);
  }
}

export async function getSavedMeals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const meals = await MealsService.getSavedMeals(req.user.userId);
    res.json({ success: true, data: { meals } });
  } catch (err) {
    next(err);
  }
}

export async function saveMeal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    const meal = await MealsService.saveMeal(req.user.userId, req.params.mealId);
    res.status(201).json({ success: true, data: { meal } });
  } catch (err) {
    next(err);
  }
}
