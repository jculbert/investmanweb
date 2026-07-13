import type { Note } from '../types/Note';

// Use the Vite dev proxy so the browser does not call the backend directly and hit CORS.
const API_URL = '/backend/notes/';

export async function fetchNotes(symbol?: string): Promise<Note[]> {
  const url = new URL(API_URL, window.location.origin);

  if (symbol) {
    url.searchParams.set('symbol', symbol);
  }

  const response = await fetch(url.toString());

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

export async function deleteNote(id: number): Promise<void> {
  const response = await fetch(`${API_URL}${id}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
}
