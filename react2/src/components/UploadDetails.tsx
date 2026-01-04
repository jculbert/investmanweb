import { useEffect, useState } from 'react';
import type { Upload } from '../types/Upload';
import { fetchUploadById, updateUpload } from '../services/uploadsService';
import './Uploads.css';

interface Props {
  uploadId: number;
  onSave: (updated: Upload) => void;
  onCancel: () => void;
}

export default function UploadDetails({ uploadId, onSave, onCancel }: Props) {
  const [upload, setUpload] = useState<Upload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchUploadById(uploadId);
        setUpload(data);
        setNotes(data.notes || '');
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load upload');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uploadId]);

  const isDirty = () => upload ? (upload.notes || '') !== notes : false;

  const doSave = async () => {
    if (!upload) return;
    try {
      setSaving(true);
      setSaveError(null);
      const payload: Upload = { ...upload, notes };
      const updated = await updateUpload(payload);
      setUpload(updated);
      setNotes(updated.notes || '');
      onSave(updated);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save upload');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-msg">Loading upload...</div>;
  if (error) return <div className="error-msg">Error: {error}</div>;
  if (!upload) return null;

  return (
    <div className="uploads-details">
      <button className="back-btn" onClick={onCancel}>← Back</button>
      <h2>Upload #{upload.id}</h2>
      {saveError && <div className="error-msg">{saveError}</div>}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600 }}>ID</label>
        <div>{upload.id}</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600 }}>Date</label>
        <div>{upload.date}</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600 }}>File</label>
        <div>{upload.file_name}</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600 }}># Transactions</label>
        <div>{upload.num_transactions}</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600 }}>Result</label>
        <div>{upload.result}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600 }}>Notes</label>
        <textarea rows={10} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600 }}>Content</label>
        <textarea rows={10} value={upload.content || ''} readOnly style={{ width: '100%' }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="toggle-btn" onClick={doSave} disabled={!isDirty() || saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button className="back-btn" onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>
      </div>
    </div>
  );
}
