import { Injectable } from '@nestjs/common';
import type OpenAI from 'openai';
import { NotesService } from '../notes/notes.service';
import type { SearchNotesResult } from './plan-agent.types';

export const PLAN_AGENT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_travel_notes',
      description:
        '搜索旅行攻略与平台笔记。规划前必须多次调用，用不同关键词检索目的地、偏好、美食、景点相关内容。',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索关键词，如「青岛 啤酒 海鲜 三日游」',
          },
        },
        required: ['query'],
      },
    },
  },
];

@Injectable()
export class PlanAgentTools {
  private readonly seenNoteIds = new Set<string>();

  constructor(private readonly notesService: NotesService) {}

  resetSession() {
    this.seenNoteIds.clear();
  }

  async searchTravelNotes(
    query: string,
    destination?: string,
  ): Promise<SearchNotesResult> {
    const notes = await this.notesService.search(query, {
      limit: 5,
      destination,
    });

    const fresh = notes.filter((note) => {
      if (this.seenNoteIds.has(note.id)) {
        return false;
      }
      this.seenNoteIds.add(note.id);
      return true;
    });

    const picked = fresh.length ? fresh : [];
    const duplicate = !fresh.length && notes.length > 0;

    return {
      query,
      count: picked.length,
      freshCount: picked.length,
      duplicate,
      matchedTitles: notes.map((note) => note.title),
      titles: picked.map((note) => note.title),
      notes: picked.map((note) => ({
        id: note.id,
        title: note.title,
        snippet: note.snippet,
        content: note.content,
        destination: note.destination,
      })),
    };
  }
}
