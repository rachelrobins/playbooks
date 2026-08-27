/**
 * Defines the routes for trigger simulation.
 * All routes require authentication before reaching the controller.
 */
import { Router } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import { authGuard } from '../../middleware/authGuard';
import { simulateTriggerHandler } from './simulate.controller';

export const simulateRouter = Router();

simulateRouter.use(authGuard);
simulateRouter.post('/', asyncHandler(simulateTriggerHandler));
