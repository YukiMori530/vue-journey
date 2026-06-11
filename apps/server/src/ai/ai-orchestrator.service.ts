import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  buildParseUserPrompt,
  buildPlanUserPrompt,
  buildRetryPrompt,
  SYSTEM_PROMPT,
} from './prompts';
import {
  formatZodErrors,
  type ItineraryOutput,
  validateItinerary,
} from './schemas/itinerary.schema';
import {
  buildTitle,
  mockDayPlans,
} from '../trips/trip-builder';
import { parseGuideText } from '../trips/parse-guide';
import type { PlanItineraryDto } from './dto/plan-itinerary.dto';
import { z } from 'zod';

const MAX_ATTEMPTS = 3;

@Injectable()
export class AiOrchestratorService {
  private readonly logger = new Logger(AiOrchestratorService.name);
  private readonly client: OpenAI | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    const baseURL =
      this.configService.get<string>('DEEPSEEK_BASE_URL') ??
      'https://api.deepseek.com';

    this.client = apiKey
      ? new OpenAI({ apiKey, baseURL })
      : null;
  }

  async planItinerary(dto: PlanItineraryDto): Promise<ItineraryOutput> {
    if (!this.client) {
      this.logger.warn('DEEPSEEK_API_KEY 未配置，使用本地 mock 行程');
      return this.mockItinerary(dto);
    }

    return this.generateItinerary([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildPlanUserPrompt(dto) },
    ]);
  }

  async parseGuideText(text: string): Promise<ItineraryOutput> {
    if (!this.client) {
      this.logger.warn('DEEPSEEK_API_KEY 未配置，使用本地规则解析');
      return this.mockParseItinerary(text);
    }

    return this.generateItinerary([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildParseUserPrompt(text) },
    ]);
  }

  private async generateItinerary(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  ): Promise<ItineraryOutput> {
    let lastError = '未知错误';

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const response = await this.client!.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.4,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        lastError = 'AI 返回空内容';
        messages.push({
          role: 'user',
          content: buildRetryPrompt(lastError),
        });
        continue;
      }

      try {
        const parsed = JSON.parse(content) as unknown;
        return validateItinerary(parsed);
      } catch (error) {
        if (error instanceof z.ZodError) {
          lastError = formatZodErrors(error);
        } else if (error instanceof SyntaxError) {
          lastError = 'JSON 解析失败';
        } else if (error instanceof Error) {
          lastError = error.message;
        } else {
          lastError = 'JSON 解析失败';
        }
        messages.push({
          role: 'user',
          content: buildRetryPrompt(lastError),
        });
      }
    }

    throw new Error(`AI 行程生成失败：${lastError}`);
  }

  private mockItinerary(dto: PlanItineraryDto): ItineraryOutput {
    const dayPlans = mockDayPlans(dto.destination, dto.days);

    return {
      title: buildTitle(dto.destination, dto.days, dto.preferences),
      days: dayPlans.map((day) => ({
        day: day.day,
        pois: day.places.map((name, index) => ({
          name,
          duration: 60 + index * 30,
          category: index % 2 === 0 ? 'sight' : 'food',
        })),
      })),
    };
  }

  private mockParseItinerary(text: string): ItineraryOutput {
    const parsed = parseGuideText(text);

    return {
      title: `${parsed.destination}${parsed.days}日导入行程`,
      days: parsed.dayPlans.map((day) => ({
        day: day.day,
        pois: day.places.map((name, index) => ({
          name,
          duration: 60 + index * 20,
          category: 'sight' as const,
        })),
      })),
    };
  }
}
