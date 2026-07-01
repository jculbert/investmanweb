import { useEffect, useState } from 'react';
import type { Note } from '../types/Note';
import { fetchNotes } from '../services/noteService';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotes() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchNotes();
        setNotes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notes');
      } finally {
        setLoading(false);
      }
    }

    void loadNotes();
  }, []);

  if (loading) {
    return <div>Loading notes...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            display: 'flex',
            gap: '16px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '12px',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ minWidth: '220px' }}>
            <div><strong>Date:</strong> {note.date}</div>
            <div><strong>Account:</strong> {note.account}</div>
            <div><strong>Symbol 1:</strong> {note.symbol1 ?? '—'}</div>
            <div><strong>Symbol 2:</strong> {note.symbol2 ?? '—'}</div>
          </div>

          <div style={{ flex: 1 }}>
            <textarea
              readOnly
              value={note.note ?? ''}
              rows={6}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
