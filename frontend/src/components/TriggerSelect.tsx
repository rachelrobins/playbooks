/**
 * Renders a dropdown for selecting a trigger from the available options.
 */
import { Trigger } from '../types/domain';

interface TriggerSelectProps {
  triggers: Trigger[];
  value: Trigger | '';
  onChange: (trigger: Trigger) => void;
}

/** Renders a dropdown select element for choosing a trigger. */
export function TriggerSelect({ triggers, value, onChange }: TriggerSelectProps) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value as Trigger)} required>
      <option value="" disabled>
        Select a trigger…
      </option>
      {triggers.map((trigger) => (
        <option key={trigger} value={trigger}>
          {trigger}
        </option>
      ))}
    </select>
  );
}
