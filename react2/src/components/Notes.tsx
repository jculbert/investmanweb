import { useEffect, useState } from 'react';
import type { Note } from '../types/Note';
import { fetchNotes, updateNote } from '../services/noteService';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editedNote, setEditedNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const hasChanges = Boolean(selectedNote && editedNote && JSON.stringify(editedNote) !== JSON.stringify(selectedNote));

  const handleFieldChange = (field: keyof Note, value: string | null) => {
    if (!editedNote) return;
    setEditedNote({ ...editedNote, [field]: value });
  };

  const handleSave = async () => {
    if (!hasChanges || !editedNote || !selectedNote) return;

    try {
      setSaving(true);
      setSaveError(null);
      const savedNote = await updateNote(selectedNote.id, editedNote);
      setNotes((current) => current.map((note) => (note.id === savedNote.id ? savedNote : note)));
      setSelectedNote(null);
      setEditedNote(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setSelectedNote(null);
    setEditedNote(null);
    setSaveError(null);
  };

  if (loading) {
    return <div>Loading notes...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (selectedNote) {
    const current = editedNote ?? selectedNote;

    return (
      <div>
        <button onClick={handleBack} style={{ marginBottom: '12px' }}>
          ← Back
        </button>

        <div style={{ backgroundColor: '#f3f3f3', border: '1px solid #ddd', borderRadius: '6px', padding: '16px', maxWidth: '900px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>{current.account || 'Note Details'}</h3>
            <button onClick={handleSave} disabled={!hasChanges || saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          {saveError && <div style={{ color: 'crimson', marginBottom: '8px' }}>{saveError}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>ID</label>
              <input value={current.id} disabled style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Date</label>
              <input
                value={current.date ?? ''}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Account</label>
              <input
                value={current.account ?? ''}
                onChange={(e) => handleFieldChange('account', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Symbol 1</label>
              <input
                value={current.symbol1 ?? ''}
                onChange={(e) => handleFieldChange('symbol1', e.target.value || null)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Symbol 2</label>
              <input
                value={current.symbol2 ?? ''}
                onChange={(e) => handleFieldChange('symbol2', e.target.value || null)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Note</label>
              <textarea
                value={current.note ?? ''}
                rows={10}
                onChange={(e) => handleFieldChange('note', e.target.value || null)}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {notes.length === 0 ? (
        <div>No notes found.</div>
      ) : (
        notes.map((note) => (
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
              justifyContent: 'space-between',
            }}
          >
            <div style={{ minWidth: '220px' }}>
              <div><strong>ID:</strong> {note.id}</div>
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

            <button onClick={() => { setSelectedNote(note); setEditedNote({ ...note }); setSaveError(null); }}>
              Details
            </button>
          </div>
        ))
      )}
    </div>
  );
}
