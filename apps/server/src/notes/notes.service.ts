import { Injectable } from '@nestjs/common';
import { xhsNotes, type XhsNote } from './notes.data';

@Injectable()
export class NotesService {
  search(query: string): XhsNote[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return xhsNotes.slice(0, 6);
    }

    return xhsNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.destination.toLowerCase().includes(q) ||
        note.snippet.toLowerCase().includes(q) ||
        note.keywords.some((keyword) => keyword.toLowerCase().includes(q)),
    );
  }

  findById(id: string): XhsNote | undefined {
    return xhsNotes.find((note) => note.id === id);
  }
}
