/**
 * Handles playbook API requests by validating input and delegating operations
 * to the playbook service for the authenticated user.
 */
import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authGuard';
import * as playbooksService from './playbooks.service';
import { createPlaybookSchema } from './playbooks.schemas';

// Handles the request to list all playbooks for the authenticated user.
export async function listPlaybooksHandler(req: AuthenticatedRequest, res: Response) {
  const playbooks = await playbooksService.listPlaybooks(req.user!.userId);
  res.status(200).json(playbooks);
}

// Handles the request to create a new playbook for the authenticated user.
export async function createPlaybookHandler(req: AuthenticatedRequest, res: Response) {
  const input = createPlaybookSchema.parse(req.body);
  const playbook = await playbooksService.createPlaybook(req.user!.userId, input);
  res.status(201).json(playbook);
}

// Handles the request to delete a playbook for the authenticated user.
export async function deletePlaybookHandler(req: AuthenticatedRequest, res: Response) {
  await playbooksService.deletePlaybook(req.user!.userId, req.params.id);
  res.status(204).send();
}
