import { Playbook } from '../types/domain';

interface PlaybookCardProps {
  playbook: Playbook;
  onDelete: (id: string) => void;
}

/** Renders a card displaying information about a playbook and provides a delete option. */
export function PlaybookCard({ playbook, onDelete }: PlaybookCardProps) {
  return (
    <div className="playbook-card">
      <div className="playbook-card__header">
        <h3>{playbook.name}</h3>
        <button type="button" onClick={() => onDelete(playbook.id)} className="playbook-card__delete">
          Delete
        </button>
      </div>
      <p className="playbook-card__trigger">
        Trigger: <strong>{playbook.trigger}</strong>
      </p>
      <ul className="playbook-card__actions">
        {playbook.actions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ul>
    </div>
  );
}
