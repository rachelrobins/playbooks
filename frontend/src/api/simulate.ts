import { apiRequest } from './client';
import { SimulationResult, Trigger } from '../types/domain';

/** Simulates a trigger and returns the playbooks that would be executed. */
export function simulateTrigger(token: string, trigger: Trigger) {
  return apiRequest<SimulationResult>('/simulateTrigger', { method: 'POST', body: { trigger }, token });
}
