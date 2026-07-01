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

export async function createNote(note: Note): Promise<Note> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function updateNote(id: number, note: Note): Promise<Note> {
  const response = await fetch(`${API_URL}${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
