import { Router } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import { authGuard } from '../../middleware/authGuard';
import {
  createPlaybookHandler,
  deletePlaybookHandler,
  listPlaybooksHandler,
} from './playbooks.controller';

export const playbooksRouter = Router();

playbooksRouter.use(authGuard);
playbooksRouter.get('/', asyncHandler(listPlaybooksHandler));
playbooksRouter.post('/', asyncHandler(createPlaybookHandler));
playbooksRouter.delete('/:id', asyncHandler(deletePlaybookHandler));
