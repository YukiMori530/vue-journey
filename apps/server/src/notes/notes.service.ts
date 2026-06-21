import { Injectable } from '@nestjs/common';
import { xhsNotes, type XhsNote } from './notes.data';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,，、/|]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 1);
}

function scoreNote(note: XhsNote, tokens: string[]): number {
  const haystack = [
    note.title,
    note.destination,
    note.snippet,
    note.content,
    ...note.keywords,
  ]
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += token.length >= 2 ? 3 : 1;
    }
  }
  return score;
}

@Injectable()
export class NotesService {
  search(query: string, opts?: { limit?: number; destination?: string }): XhsNote[] {
    const limit = opts?.limit ?? 6;
    const q = query.trim().toLowerCase();
    if (!q) {
      return xhsNotes.slice(0, limit);
    }

    const tokens = tokenize(q);
    const destination = opts?.destination?.replace(/(市|县|区)$/, '');

    const ranked = xhsNotes
      .map((note) => ({
        note,
        score: scoreNote(note, tokens) + (destination && note.destination.includes(destination) ? 5 : 0),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    if (ranked.length) {
      return ranked.slice(0, limit).map(({ note }) => note);
    }

    return xhsNotes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(q) ||
          note.destination.toLowerCase().includes(q) ||
          note.snippet.toLowerCase().includes(q) ||
          note.keywords.some((keyword) => keyword.toLowerCase().includes(q)),
      )
      .slice(0, limit);
  }

  findById(id: string): XhsNote | undefined {
    return xhsNotes.find((note) => note.id === id);
  }
}
