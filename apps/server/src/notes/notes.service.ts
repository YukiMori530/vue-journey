import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { travelGuideSeeds } from './guides.seed-data';
import type { XhsNote } from './notes.data';

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
    note.category ?? '',
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

function rankNotes(
  notes: XhsNote[],
  query: string,
  opts?: { limit?: number; destination?: string },
): XhsNote[] {
  const limit = opts?.limit ?? 6;
  const q = query.trim().toLowerCase();
  if (!q) {
    return notes.slice(0, limit);
  }

  const tokens = tokenize(q);
  const destination = opts?.destination?.replace(/(市|县|区)$/, '');

  const ranked = notes
    .map((note) => ({
      note,
      score:
        scoreNote(note, tokens) +
        (destination && note.destination.includes(destination) ? 8 : 0) +
        (destination && note.title.includes(destination) ? 3 : 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length) {
    return ranked.slice(0, limit).map(({ note }) => note);
  }

  return notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.destination.toLowerCase().includes(q) ||
        note.snippet.toLowerCase().includes(q) ||
        note.keywords.some((keyword) => keyword.toLowerCase().includes(q)),
    )
    .slice(0, limit);
}

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapRow(row: {
    id: string
    title: string
    author: string
    cover: string
    destination: string
    days: number
    category: string
    likes: string
    snippet: string
    content: string
    keywords: string[]
  }): XhsNote {
    return {
      id: row.id,
      title: row.title,
      author: row.author,
      cover: row.cover,
      destination: row.destination,
      days: row.days,
      category: row.category,
      likes: row.likes,
      snippet: row.snippet,
      content: row.content,
      keywords: row.keywords,
    };
  }

  private fallbackNotes(): XhsNote[] {
    return travelGuideSeeds.map((guide) => ({
      id: guide.id,
      title: guide.title,
      author: guide.author,
      cover: guide.cover,
      destination: guide.destination,
      days: guide.days,
      category: guide.category,
      likes: guide.likes,
      snippet: guide.snippet,
      content: guide.content,
      keywords: guide.keywords,
    }));
  }

  private async loadNotes(destination?: string): Promise<XhsNote[]> {
    try {
      const dest = destination?.replace(/(市|县|区)$/, '');
      const rows = await this.prisma.travelGuide.findMany({
        where: dest
          ? {
              OR: [
                { destination: { contains: dest } },
                { keywords: { has: dest } },
              ],
            }
          : undefined,
        orderBy: { destination: 'asc' },
      });

      if (rows.length) {
        return rows.map((row) => this.mapRow(row));
      }

      const all = await this.prisma.travelGuide.findMany({
        orderBy: { destination: 'asc' },
      });
      if (all.length) {
        return all.map((row) => this.mapRow(row));
      }
    } catch (error) {
      this.logger.warn('读取攻略库失败，使用内置种子数据', error);
    }

    return this.fallbackNotes();
  }

  async search(
    query: string,
    opts?: { limit?: number; destination?: string },
  ): Promise<XhsNote[]> {
    const notes = await this.loadNotes(opts?.destination);
    return rankNotes(notes, query, opts);
  }

  private citySlug(destination: string): string {
    const map: Record<string, string> = {
      北京: 'beijing',
      成都: 'chengdu',
      上海: 'shanghai',
      烟台: 'yantai',
      敦煌: 'dunhuang',
      天津: 'tianjin',
      保定: 'baoding',
      昆明: 'kunming',
      南昌: 'nanchang',
      福州: 'fuzhou',
      平潭: 'pingtan',
    };
    const key = destination.replace(/(市|县|区|省)$/, '');
    return map[key] ?? key.toLowerCase().replace(/\s+/g, '-');
  }

  async getExploreFeed() {
    const notes = await this.loadNotes();
    const collections = notes.slice(0, 8).map((note) => ({
      id: note.id,
      title: note.title,
      cover: note.cover,
      destination: note.destination,
    }));

    const cityMap = new Map<
      string,
      {
        id: string
        name: string
        cover: string
        planCount: string
        description: string
        rankTag?: string
        guideCount: number
      }
    >();

    notes.forEach((note, index) => {
      const key = note.destination.replace(/(市|县|区)$/, '') || note.destination;
      const existing = cityMap.get(key);
      if (existing) {
        existing.guideCount += 1;
        return;
      }
      cityMap.set(key, {
        id: this.citySlug(key),
        name: note.destination.includes('市') ? note.destination : `${note.destination}市`,
        cover: note.cover,
        planCount: note.likes ? `${note.likes} 人收藏攻略` : `${Math.max(3, note.days * 2)} 篇攻略`,
        description: note.snippet,
        rankTag: index < 2 ? `中国热度 top${index + 2}` : undefined,
        guideCount: 1,
      });
    });

    return {
      collections,
      hotCities: [...cityMap.values()].slice(0, 12),
    };
  }

  async findByDestination(destination: string, limit = 12): Promise<XhsNote[]> {
    const notes = await this.loadNotes(destination);
    return notes.slice(0, limit);
  }

  async findById(id: string): Promise<XhsNote | undefined> {
    try {
      const row = await this.prisma.travelGuide.findUnique({ where: { id } });
      if (row) {
        return this.mapRow(row);
      }
    } catch {
      // fallback below
    }

    return this.fallbackNotes().find((note) => note.id === id);
  }
}
