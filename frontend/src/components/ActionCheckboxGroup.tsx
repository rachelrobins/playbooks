import { Action } from '../types/domain';

interface ActionCheckboxGroupProps {
  actions: Action[];
  selected: Action[];
  maxSelected: number;
  onChange: (selected: Action[]) => void;
}

/** Renders a group of action checkboxes with a configurable selection limit. */
export function ActionCheckboxGroup({ actions, selected, maxSelected, onChange }: ActionCheckboxGroupProps) {

  // Toggles an action while preventing the selection from exceeding the maximum.
  function toggle(action: Action) {
    if (selected.includes(action)) {
      onChange(selected.filter((a) => a !== action));
      return;
    }
    if (selected.length >= maxSelected) return;
    onChange([...selected, action]);
  }

  return (
    <div className="action-checkbox-group">
      {actions.map((action) => {
        const checked = selected.includes(action);
        const disabled = !checked && selected.length >= maxSelected;
        return (
          <label key={action} className={disabled ? 'disabled' : ''}>
            <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(action)} />
            {action}
          </label>
        );
      })}
    </div>
  );
}
