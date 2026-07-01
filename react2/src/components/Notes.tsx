import { useEffect, useState } from 'react';
import type { Note } from '../types/Note';
import { fetchNotes, updateNote } from '../services/noteService';
import { fetchAccounts } from '../services/holdingsService';
import './Notes.css';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editedNote, setEditedNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [accountNames, setAccountNames] = useState<string[]>([]);

  useEffect(() => {
    async function loadNotes() {
      try {
        setLoading(true);
        setError(null);
        const [notesData, accountsData] = await Promise.all([fetchNotes(), fetchAccounts()]);
        setNotes(notesData);
        setAccountNames(accountsData.map((account) => account.name));
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
    return <div className="notes-list">Loading notes...</div>;
  }

  if (error) {
    return <div className="notes-list">{error}</div>;
  }

  if (selectedNote) {
    const current = editedNote ?? selectedNote;

    return (
      <div className="notes-list">
        <button className="notes-back-btn" onClick={handleBack}>
          ← Back
        </button>

        <div className="notes-details">
          <div className="notes-details-header">
            <h3>Note: {current.id}</h3>
            <button
              className={`notes-save-btn ${hasChanges ? 'active' : 'disabled'}`}
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          {saveError && <div className="notes-error">{saveError}</div>}

          <div className="notes-details-grid">
            <div className="notes-detail-row">
              <label className="notes-detail-label">Date:</label>
              <input
                className="notes-detail-input"
                value={current.date ?? ''}
                onChange={(e) => handleFieldChange('date', e.target.value)}
              />
            </div>

            <div className="notes-detail-row">
              <label className="notes-detail-label">Account:</label>
              <select
                className="notes-detail-input"
                value={current.account ?? ''}
                onChange={(e) => handleFieldChange('account', e.target.value)}
              >
                <option value="">Select account</option>
                {accountNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="notes-detail-row">
              <label className="notes-detail-label">Symbol 1:</label>
              <input
                className="notes-detail-input"
                value={current.symbol1 ?? ''}
                onChange={(e) => handleFieldChange('symbol1', e.target.value || null)}
              />
            </div>

            <div className="notes-detail-row">
              <label className="notes-detail-label">Symbol 2:</label>
              <input
                className="notes-detail-input"
                value={current.symbol2 ?? ''}
                onChange={(e) => handleFieldChange('symbol2', e.target.value || null)}
              />
            </div>

            <div className="notes-detail-row" style={{ gridColumn: '1 / -1' }}>
              <label className="notes-detail-label">Note:</label>
              <textarea
                className="notes-detail-textarea"
                value={current.note ?? ''}
                rows={10}
                onChange={(e) => handleFieldChange('note', e.target.value || null)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-list">
      {notes.length === 0 ? (
        <div className="notes-empty">No notes found.</div>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            className="notes-card"
            onClick={() => {
              setSelectedNote(note);
              setEditedNote({ ...note });
              setSaveError(null);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedNote(note);
                setEditedNote({ ...note });
                setSaveError(null);
              }
            }}
          >
            <div className="notes-card-summary">
              <div><strong>ID:</strong> {note.id}</div>
              <div><strong>Date:</strong> {note.date}</div>
              <div><strong>Account:</strong> {note.account}</div>
              <div><strong>Symbol 1:</strong> {note.symbol1 ?? '—'}</div>
              <div><strong>Symbol 2:</strong> {note.symbol2 ?? '—'}</div>
            </div>

            <div className="notes-card-note">
              <textarea readOnly value={note.note ?? ''} rows={6} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
