/**
 * Handles API requests for simulating security triggers.
 * Validates the request and delegates the simulation to the service layer.
 */
import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authGuard';
import * as simulateService from './simulate.service';
import { simulateTriggerSchema } from './simulate.schemas';

// Handles the request to simulate a trigger for the authenticated user.
export async function simulateTriggerHandler(req: AuthenticatedRequest, res: Response) {
  const input = simulateTriggerSchema.parse(req.body);
  const result = await simulateService.simulateTrigger(req.user!.userId, input.trigger);
  res.status(200).json(result);
}
