import { useEffect, useState } from 'react';
import type { Upload } from '../types/Upload';
import { fetchUploads } from '../services/uploadsService';
import './Uploads.css';

export default function Uploads() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="uploads-list">
      <h2>Uploads</h2>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
