import { apiRequest } from './client';
import { Action, Playbook, Trigger } from '../types/domain';

export function listPlaybooks(token: string) {
  return apiRequest<Playbook[]>('/playbooks', { token });
}

export function createPlaybook(token: string, input: { name: string; trigger: Trigger; actions: Action[] }) {
  return apiRequest<Playbook>('/playbooks', { method: 'POST', body: input, token });
}

export function deletePlaybook(token: string, id: string) {
  return apiRequest<void>(`/playbooks/${id}`, { method: 'DELETE', token });
}
