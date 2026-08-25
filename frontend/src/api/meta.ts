import { apiRequest } from './client';
import { Action, Trigger } from '../types/domain';

export interface Meta {
  triggers: Trigger[];
  actions: Action[];
}

export function getMeta() {
  return apiRequest<Meta>('/meta');
}
