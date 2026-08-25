import { Router } from 'express';
import { ACTIONS, TRIGGERS } from '../../common/domain';

export const metaRouter = Router();

metaRouter.get('/', (_req, res) => {
  res.status(200).json({ triggers: TRIGGERS, actions: ACTIONS });
});
