export type Trigger = 'Malware Detected' | 'Login Attempt' | 'Phishing Alert';
export type Action = 'Isolate Host' | 'Notify Admin' | 'Block IP';

export interface Playbook {
  id: string;
  name: string;
  trigger: Trigger;
  actions: Action[];
  createdAt: string;
}

export interface MatchedPlaybook {
  id: string;
  name: string;
  actions: Action[];
}

export interface SimulationResult {
  trigger: Trigger;
  matchedPlaybooks: MatchedPlaybook[];
}

export interface AuthUser {
  id: string;
  email: string;
}
