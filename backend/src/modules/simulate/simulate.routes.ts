import { Router } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import { authGuard } from '../../middleware/authGuard';
import { simulateTriggerHandler } from './simulate.controller';

export const simulateRouter = Router();

simulateRouter.use(authGuard);
simulateRouter.post('/', asyncHandler(simulateTriggerHandler));
