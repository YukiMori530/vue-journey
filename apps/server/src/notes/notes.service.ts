import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { travelGuideSeeds } from './guides.seed-data';
import type { XhsNote } from './notes.data';
import {
  destinationAliases,
  normalizeSearchDestination,
  noteMatchesDestination,
} from './destination.utils';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,，、/|]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 1);
}

const CITY_LANDMARKS: Record<string, string> = {
  三亚: '亚龙湾',
  丽江: '丽江古城',
  北京: '故宫博物院',
  南京: '中山陵',
  上海: '外滩',
  南昌: '滕王阁',
  成都: '宽窄巷子',
  昆明: '翠湖公园',
  福州: '三坊七巷',
  平潭: '坛南湾',
  烟台: '蓬莱阁',
  敦煌: '莫高窟',
  天津: '天津之眼',
  保定: '直隶总督署',
};

function normalizeDestination(destination: string): string {
  return destination.replace(/(市|县|区|省)$/, '').trim();
}

function extractFirstPlace(content: string): string | null {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (/^第\s*[0-9一二三四五六七八九十]+\s*天/.test(line)) {
      continue;
    }
    const place = line.replace(/^[\s\-·•*\d+.、)）]+/, '').trim();
    if (place.length >= 2 && !/^第/.test(place)) {
      return place;
    }
  }
  return null;
}

function resolveCoverPlace(note: XhsNote): string {
  return (
    extractFirstPlace(note.content) ??
    CITY_LANDMARKS[normalizeDestination(note.destination)] ??
    normalizeDestination(note.destination)
  );
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
  const destination = opts?.destination
    ? normalizeSearchDestination(opts.destination)
    : '';

  let pool = notes;
  if (destination) {
    const matched = notes.filter((note) => noteMatchesDestination(note, destination));
    if (matched.length) {
      pool = matched;
    } else {
      return [];
    }
  }

  if (!q) {
    return pool.slice(0, limit);
  }

  const tokens = tokenize(q);
  const aliases = destination ? destinationAliases(destination) : [];

  const ranked = pool
    .map((note) => {
      let score = scoreNote(note, tokens);
      if (destination) {
        if (note.destination.includes(destination)) {
          score += 12;
        }
        if (note.title.includes(destination)) {
          score += 6;
        }
        for (const alias of aliases) {
          if (alias.length >= 2 && note.title.includes(alias)) {
            score += 4;
          }
        }
      }
      return { note, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length) {
    return ranked.slice(0, limit).map(({ note }) => note);
  }

  return pool
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
    const normalizedDest = destination
      ? normalizeSearchDestination(destination)
      : '';

    let allNotes: XhsNote[] = [];
    try {
      const rows = await this.prisma.travelGuide.findMany({
        orderBy: { destination: 'asc' },
      });
      if (rows.length) {
        allNotes = rows.map((row) => this.mapRow(row));
      }
    } catch (error) {
      this.logger.warn('读取攻略库失败，使用内置种子数据', error);
    }

    if (!allNotes.length) {
      allNotes = this.fallbackNotes();
    }

    if (!normalizedDest) {
      return allNotes;
    }

    const aliases = destinationAliases(normalizedDest);
    const matched = allNotes.filter((note) =>
      noteMatchesDestination(note, normalizedDest),
    );
    if (matched.length) {
      return matched;
    }

    const loose = allNotes.filter((note) => {
      const haystack = `${note.destination}${note.title}${note.keywords.join('')}`;
      return aliases.some((alias) => alias.length >= 2 && haystack.includes(alias));
    });
    if (loose.length) {
      return loose;
    }

    return this.fallbackNotes().filter((note) =>
      noteMatchesDestination(note, normalizedDest),
    );
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
      上海: 'shanghai',
      成都: 'chengdu',
      杭州: 'hangzhou',
      西安: 'xian',
      厦门: 'xiamen',
      青岛: 'qingdao',
      重庆: 'chongqing',
      广州: 'guangzhou',
      南京: 'nanjing',
      苏州: 'suzhou',
      武汉: 'wuhan',
      长沙: 'changsha',
      南昌: 'nanchang',
      昆明: 'kunming',
      三亚: 'sanya',
      丽江: 'lijiang',
      大理: 'dali',
      桂林: 'guilin',
      深圳: 'shenzhen',
      哈尔滨: 'harbin',
      张家界: 'zhangjiajie',
      敦煌: 'dunhuang',
      烟台: 'yantai',
      天津: 'tianjin',
      保定: 'baoding',
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
      coverPlace: resolveCoverPlace(note),
      destination: note.destination,
    }));

    const cityMap = new Map<
      string,
      {
        id: string
        name: string
        cover: string
        coverPlace: string
        planCount: string
        description: string
        rankTag?: string
        guideCount: number
      }
    >();

    notes.forEach((note, index) => {
      const key = normalizeDestination(note.destination) || note.destination;
      const existing = cityMap.get(key);
      if (existing) {
        existing.guideCount += 1;
        return;
      }
      cityMap.set(key, {
        id: this.citySlug(key),
        name: note.destination.includes('市') ? note.destination : `${note.destination}市`,
        cover: note.cover,
        coverPlace: resolveCoverPlace(note),
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
