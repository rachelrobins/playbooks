/**
 * Defines the API representation of a playbook returned by the backend.
 */
import { Action, Trigger } from '../../common/domain';

export interface PlaybookDto {
  id: string;
  name: string;
  trigger: Trigger;
  actions: Action[];
  createdAt: string;
}
