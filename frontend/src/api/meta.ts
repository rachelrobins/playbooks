import { apiRequest } from './client';
import { Action, Trigger } from '../types/domain';

export interface Meta {
  triggers: Trigger[];
  actions: Action[];
  minActions: number;
  maxActions: number;
}

/** Fetches the available triggers and actions supported by the application. */
export function getMeta() {
  return apiRequest<Meta>('/meta');
}
