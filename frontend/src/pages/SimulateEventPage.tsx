/**
 * Renders the page for simulating security event triggers.
 * Loads available triggers and displays the playbooks that would be triggered.
 */
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import * as simulateApi from '../api/simulate';
import * as metaApi from '../api/meta';
import { SimulationResult, Trigger } from '../types/domain';
import { ErrorBanner } from '../components/ErrorBanner';
import { TriggerSelect } from '../components/TriggerSelect';

// Renders the page for simulating an event trigger.
export function SimulateEventPage() {
  const { token } = useAuth();

  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [trigger, setTrigger] = useState<Trigger | ''>('');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    metaApi
      .getMeta()
      .then((meta) => setTriggers(meta.triggers))
      .catch(() => setError('Failed to load triggers.'));
  }, []);

  // Handle form submission to simulate the selected trigger.
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !trigger) return;

    setError(null);
    setSubmitting(true);
    setResult(null);

    try {
      const simulation = await simulateApi.simulateTrigger(token, trigger);
      setResult(simulation);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to simulate trigger.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page simulate-page">
      <h1>Simulate Event</h1>

      <form onSubmit={handleSubmit} className="simulate-form">
        <label>
          Trigger
          <TriggerSelect triggers={triggers} value={trigger} onChange={setTrigger} />
        </label>

        <ErrorBanner message={error} />

        <button type="submit" disabled={submitting || !trigger}>
          {submitting ? 'Simulating…' : 'Simulate'}
        </button>
      </form>

      {result && (
        <section className="simulation-results">
          <h2>Results for "{result.trigger}"</h2>
          {result.matchedPlaybooks.length === 0 ? (
            <p>No playbooks match this trigger.</p>
          ) : (
            <ul className="simulation-results__list">
              {result.matchedPlaybooks.map((playbook) => (
                <li key={playbook.id} className="simulation-results__item">
                  <h3>{playbook.name}</h3>
                  <p>Actions that would run:</p>
                  <ul>
                    {playbook.actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
