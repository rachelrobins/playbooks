/**
 * Defines the supported playbook triggers and actions, along with the allowed
 * range of actions that can be selected for a playbook.
 */

export const TRIGGERS = ['Malware Detected', 'Login Attempt', 'Phishing Alert'] as const;
export const ACTIONS = ['Isolate Host', 'Notify Admin', 'Block IP'] as const;

export type Trigger = (typeof TRIGGERS)[number];
export type Action = (typeof ACTIONS)[number];

// User must select between 1-3 actions
export const MIN_ACTIONS = 1;
export const MAX_ACTIONS = 3;
