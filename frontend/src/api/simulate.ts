import { apiRequest } from './client';
import { SimulationResult, Trigger } from '../types/domain';

/** api request to /simulateTrigger (POST) */
export function simulateTrigger(token: string, trigger: Trigger) {
  return apiRequest<SimulationResult>('/simulateTrigger', { method: 'POST', body: { trigger }, token });
}
