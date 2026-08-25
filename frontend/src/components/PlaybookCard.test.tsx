import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlaybookCard } from './PlaybookCard';
import { Playbook } from '../types/domain';

const playbook: Playbook = {
  id: 'p1',
  name: 'Malware Response',
  trigger: 'Malware Detected',
  actions: ['Isolate Host', 'Notify Admin'],
  createdAt: new Date().toISOString(),
};

describe('PlaybookCard', () => {
  it('renders the playbook name, trigger, and actions', () => {
    render(<PlaybookCard playbook={playbook} onDelete={vi.fn()} />);

    expect(screen.getByText('Malware Response')).toBeInTheDocument();
    expect(screen.getByText('Malware Detected')).toBeInTheDocument();
    expect(screen.getByText('Isolate Host')).toBeInTheDocument();
    expect(screen.getByText('Notify Admin')).toBeInTheDocument();
  });

  it('calls onDelete with the playbook id when the delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<PlaybookCard playbook={playbook} onDelete={onDelete} />);

    fireEvent.click(screen.getByText('Delete'));

    expect(onDelete).toHaveBeenCalledWith('p1');
  });
});
