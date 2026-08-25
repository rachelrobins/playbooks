export const TRIGGERS = ['Malware Detected', 'Login Attempt', 'Phishing Alert'] as const;
export const ACTIONS = ['Isolate Host', 'Notify Admin', 'Block IP'] as const;

export type Trigger = (typeof TRIGGERS)[number];
export type Action = (typeof ACTIONS)[number];

export const MIN_ACTIONS = 1;
export const MAX_ACTIONS = 3;
