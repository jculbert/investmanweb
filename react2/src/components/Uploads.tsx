import { useEffect, useState, useRef } from 'react';
import type { Upload } from '../types/Upload';
import { fetchUploads, uploadFile } from '../services/uploadsService';
import './Uploads.css';
import UploadDetails from './UploadDetails';
 

export default function Uploads() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUploadId, setSelectedUploadId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchUploads();
        setUploads(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load uploads');
        setUploads([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reload = async () => {
    try {
      setLoading(true);
      const data = await fetchUploads();
      setUploads(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load uploads');
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  if (selectedUploadId) {
    return (
      <div className="uploads-list">
        <UploadDetails uploadId={selectedUploadId} onCancel={() => setSelectedUploadId(null)} onSave={async () => { await reload(); setSelectedUploadId(null); }} />
      </div>
    );
  }

  return (
    <div className="uploads-list">
      <h2>Uploads</h2>
      <div className="uploads-controls">
        <button
          className="add-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          Add
        </button>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              // optimistic: show loading state while uploading
              setLoading(true);
              const uploaded = await uploadFile(f);
              // open details view for the returned upload
              setSelectedUploadId(uploaded.id);
              // refresh list in background
              reload().catch(() => {});
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Upload failed');
            } finally {
              // clear file input so same file can be reselected
              (e.target as HTMLInputElement).value = '';
              setLoading(false);
            }
          }}
        />
      </div>
      {loading ? (
        <div className="loading-msg">Loading uploads...</div>
      ) : error ? (
        <div className="error-msg">Error: {error}</div>
      ) : (
        <table className="uploads-table">
          <thead>
            <tr>
              <th className="col-id">ID</th>
              <th className="col-date">Date</th>
              <th className="col-file">File</th>
              <th className="col-txns"># Txns</th>
              <th className="col-result">Result</th>
              <th className="col-result">Details</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((u) => (
              <tr key={u.id}>
                <td className="col-id">{u.id}</td>
                <td className="col-date">{u.date}</td>
                <td className="col-file">{u.file_name}</td>
                <td className="col-txns">{u.num_transactions}</td>
                <td className="col-result">{u.result}</td>
                <td className="col-result">
                  <button className="details-link" onClick={() => setSelectedUploadId(u.id)}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
