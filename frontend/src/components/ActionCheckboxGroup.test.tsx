import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ActionCheckboxGroup } from './ActionCheckboxGroup';

const ACTIONS = ['Isolate Host', 'Notify Admin', 'Block IP'] as const;

// Verifies action selection, removal, and maximum selection behavior.
describe('ActionCheckboxGroup', () => {
  it('calls onChange when an unselected action is checked', () => {
    const onChange = vi.fn();
    render(
      <ActionCheckboxGroup actions={[...ACTIONS]} selected={[]} maxSelected={3} onChange={onChange} />,
    );

    fireEvent.click(screen.getByLabelText('Isolate Host'));

    expect(onChange).toHaveBeenCalledWith(['Isolate Host']);
  });

  it('disables unselected checkboxes once the max is reached', () => {
    const onChange = vi.fn();
    render(
      <ActionCheckboxGroup
        actions={[...ACTIONS]}
        selected={['Isolate Host', 'Notify Admin']}
        maxSelected={2}
        onChange={onChange}
      />,
    );

    const blockIpCheckbox = screen.getByLabelText('Block IP') as HTMLInputElement;
    expect(blockIpCheckbox.disabled).toBe(true);
  });

  it('unchecking a selected action removes it', () => {
    const onChange = vi.fn();
    render(
      <ActionCheckboxGroup
        actions={[...ACTIONS]}
        selected={['Isolate Host']}
        maxSelected={3}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Isolate Host'));

    expect(onChange).toHaveBeenCalledWith([]);
  });
});
