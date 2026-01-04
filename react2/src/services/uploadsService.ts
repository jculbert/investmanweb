import type { Upload } from '../types/Upload';

const API_URL = '/api/v1/uploads/';

export async function fetchUploads(): Promise<Upload[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchUploadById(id: number): Promise<Upload> {
  const res = await fetch(`${API_URL}${id}/`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function updateUpload(upload: Upload): Promise<Upload> {
  const res = await fetch(`${API_URL}${upload.id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(upload),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
