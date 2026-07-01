import type { Note } from '../types/Note';

// Use the Vite dev proxy so the browser does not call the backend directly and hit CORS.
const API_URL = '/backend/notes/';

export async function fetchNotes(): Promise<Note[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
