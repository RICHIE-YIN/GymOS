import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import * as MealsController from './meals.controller';

export const mealsRouter = Router();

// GET /api/v1/me/meal-plan/today
mealsRouter.get('/me/meal-plan/today', authenticateToken, MealsController.getTodayMealPlan);

// GET /api/v1/meals - browse all meals
mealsRouter.get('/meals', MealsController.browseMeals);

// GET /api/v1/meals/:id
mealsRouter.get('/meals/:id', MealsController.getMeal);

// POST /api/v1/me/meal-plan/add
mealsRouter.post('/me/meal-plan/add', authenticateToken, MealsController.addMealToPlan);

// DELETE /api/v1/me/meal-plan/:itemId
mealsRouter.delete('/me/meal-plan/:itemId', authenticateToken, MealsController.removeMealFromPlan);

// GET /api/v1/me/meals/saved
mealsRouter.get('/me/meals/saved', authenticateToken, MealsController.getSavedMeals);

// POST /api/v1/me/meals/save/:mealId
mealsRouter.post('/me/meals/save/:mealId', authenticateToken, MealsController.saveMeal);
