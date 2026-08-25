import { Action, Trigger } from '../../common/domain';
import * as playbooksService from '../playbooks/playbooks.service';

export interface MatchedPlaybook {
  id: string;
  name: string;
  actions: Action[];
}

export interface SimulationResult {
  trigger: Trigger;
  matchedPlaybooks: MatchedPlaybook[];
}

export async function simulateTrigger(userId: string, trigger: Trigger): Promise<SimulationResult> {
  const playbooks = await playbooksService.listPlaybooks(userId);
  const matchedPlaybooks = playbooks
    .filter((playbook) => playbook.trigger === trigger)
    .map((playbook) => ({ id: playbook.id, name: playbook.name, actions: playbook.actions }));

  return { trigger, matchedPlaybooks };
}
