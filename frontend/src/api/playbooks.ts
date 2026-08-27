/**
 * Provides API functions for managing the authenticated user's playbooks.
 * Supports listing, creating, and deleting playbooks.
 */
import { apiRequest } from './client';
import { Action, Playbook, Trigger } from '../types/domain';

// api requests for managing playbooks (GET, POST, DELETE)

/** Fetches all playbooks belonging to the authenticated user. */
export function listPlaybooks(token: string) {
  return apiRequest<Playbook[]>('/playbooks', { token });
}

/** Creates a new playbook for the authenticated user. */
export function createPlaybook(token: string, input: { name: string; trigger: Trigger; actions: Action[] }) {
  return apiRequest<Playbook>('/playbooks', { method: 'POST', body: input, token });
}

/** Deletes a playbook belonging to the authenticated user. */
export function deletePlaybook(token: string, id: string) {
  return apiRequest<void>(`/playbooks/${id}`, { method: 'DELETE', token });
}
