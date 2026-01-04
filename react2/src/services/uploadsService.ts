import type { Upload } from '../types/Upload';

const API_URL = '/api/v1/uploads/';

export async function fetchUploads(): Promise<Upload[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
