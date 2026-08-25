import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import * as playbooksApi from '../api/playbooks';
import * as metaApi from '../api/meta';
import { Action, Playbook, Trigger } from '../types/domain';
import { ErrorBanner } from '../components/ErrorBanner';
import { PlaybookCard } from '../components/PlaybookCard';
import { TriggerSelect } from '../components/TriggerSelect';
import { ActionCheckboxGroup } from '../components/ActionCheckboxGroup';

const MAX_ACTIONS = 3;

export function CreatePlaybookPage() {
  const { token } = useAuth();

  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [availableActions, setAvailableActions] = useState<Action[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);

  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<Trigger | ''>('');
  const [actions, setActions] = useState<Action[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function load() {
      try {
        const [meta, existing] = await Promise.all([metaApi.getMeta(), playbooksApi.listPlaybooks(token!)]);
        setTriggers(meta.triggers);
        setAvailableActions(meta.actions);
        setPlaybooks(existing);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load playbooks.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !trigger) return;

    setError(null);
    setSubmitting(true);

    try {
      const created = await playbooksApi.createPlaybook(token, { name, trigger, actions });
      setPlaybooks((prev) => [created, ...prev]);
      setName('');
      setTrigger('');
      setActions([]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create playbook.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    setError(null);
    try {
      await playbooksApi.deletePlaybook(token, id);
      setPlaybooks((prev) => prev.filter((playbook) => playbook.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete playbook.');
    }
  }

  return (
    <div className="page create-playbook-page">
      <section className="create-playbook-form-section">
        <h1>Create Playbook</h1>
        <form onSubmit={handleSubmit} className="playbook-form">
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
            />
          </label>

          <label>
            Trigger
            <TriggerSelect triggers={triggers} value={trigger} onChange={setTrigger} />
          </label>

          <fieldset>
            <legend>Actions (choose 1–{MAX_ACTIONS})</legend>
            <ActionCheckboxGroup
              actions={availableActions}
              selected={actions}
              maxSelected={MAX_ACTIONS}
              onChange={setActions}
            />
          </fieldset>

          <ErrorBanner message={error} />

          <button type="submit" disabled={submitting || actions.length === 0 || !trigger}>
            {submitting ? 'Creating…' : 'Create Playbook'}
          </button>
        </form>
      </section>

      <section className="playbook-list-section">
        <h2>Your Playbooks</h2>
        {loading && <p>Loading…</p>}
        {!loading && playbooks.length === 0 && <p>No playbooks yet. Create one to get started.</p>}
        <div className="playbook-list">
          {playbooks.map((playbook) => (
            <PlaybookCard key={playbook.id} playbook={playbook} onDelete={handleDelete} />
          ))}
        </div>
      </section>
    </div>
  );
}
