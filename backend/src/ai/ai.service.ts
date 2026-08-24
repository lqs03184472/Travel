import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { buildMockPlans } from './ai.mock';
import { AdoptPlanDto, AiPlanDto } from './dto/ai.dto';
import { AiPlanResponse, StepType } from './types';

const SYSTEM_PROMPT = `你是一位资深的旅行规划专家。根据用户输入，生成三套对比方案（时间最优/价格最优/平衡推荐）。
必须返回纯 JSON，不要包含任何其他文字或 markdown，结构如下：
{
  "title": "行程名称",
  "plans": [
    {
      "id": "time|price|balance",
      "name": "方案名",
      "tagline": "一句话特点",
      "totalCost": 数字,
      "totalKm": 数字,
      "tripHours": 数字,
      "transportHours": 数字,
      "playHours": 数字,
      "days": 数字,
      "daily": [
        { "day": 1, "title": "Day 1 主题", "items": [
          { "time": "07:00", "type": "transport_main|transport_transfer|hotel|ticket|food|sight|other", "title": "事项", "cost": 数字(可空), "detail": "补充说明" }
        ]}
      ],
      "budget": { "transport": 数字, "hotel": 数字, "ticket": 数字, "food": 数字, "other": 数字 },
      "tips": ["实用贴士1", "..."],
      "alternatives": ["备选建议1", "..."]
    }
  ]
}
要求：费用用人民币整数，贴合真实市场价格；时间按小时精确排布；三套方案在交通方式、住宿档次、总价上明显差异化；提示包含天气、高反/保暖、必带物品、当地美食推荐；天数必须等于用户要求的天数。`;

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async plan(userId: string, dto: AiPlanDto): Promise<AiPlanResponse> {
    // 免费次数限制：mock 演示环境不限制，接入真实 API 后可放开
    const apiKey = this.config.get('DEEPSEEK_API_KEY');
    if (apiKey) {
      try {
        const res = await this.planWithDeepSeek(dto);
        return { ...res, input: dto, generatedAt: new Date().toISOString(), source: 'deepseek' };
      } catch (e) {
        console.warn('[AI] DeepSeek 调用失败，降级为内置演示数据:', (e as Error).message);
      }
    }
    const mock = buildMockPlans(dto);
    return { ...mock, input: dto, generatedAt: new Date().toISOString(), source: 'mock' };
  }

  private async planWithDeepSeek(dto: AiPlanDto): Promise<{ title: string; plans: AiPlanResponse['plans'] }> {
    const base = this.config.get('DEEPSEEK_BASE_URL') || 'https://api.deepseek.com';
    const model = this.config.get('DEEPSEEK_MODEL') || 'deepseek-chat';
    const apiKey = this.config.get('DEEPSEEK_API_KEY');

    const userPrompt = `出发城市：${dto.departure}
目的地：${dto.destinations.join('、')}
出行人数：${dto.people}
出行天数：${dto.days}天${dto.days - 1}夜
预算档位：${dto.budget}
偏好：${dto.preferences.join('、') || '无特别偏好'}`;

    const resp = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });
    if (!resp.ok) {
      throw new Error(`DeepSeek HTTP ${resp.status}: ${await resp.text()}`);
    }
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('DeepSeek 返回内容为空');
    const parsed = JSON.parse(content);
    return { title: parsed.title || 'AI 智能规划', plans: parsed.plans || [] };
  }

  /** 一键采纳：把方案转成行程保存到"我的行程" */
  async adopt(userId: string, dto: AdoptPlanDto) {
    const steps: {
      type: StepType;
      title: string;
      day: number;
      order: number;
      startTime: string | undefined;
      cost: number | undefined;
      durationMin?: number;
      details: Record<string, any>;
    }[] = [];

    const CAT_MAP: Record<string, string> = {
      transport: '交通',
      hotel: '住宿',
      ticket: '门票',
      food: '餐饮',
      other: '其他',
    };

    for (const day of dto.plan.daily) {
      day.items.forEach((it, i) => {
        steps.push({
          type: it.type as StepType,
          title: it.title,
          day: day.day,
          order: i,
          startTime: it.time,
          cost: it.cost,
          details: { remark: it.detail, category: CAT_MAP[it.type] || '其他' },
        });
      });
    }

    const budget = dto.plan.budget || {};
    const trip = await this.prisma.trip.create({
      data: {
        userId,
        title: dto.title,
        destination: dto.destination,
        days: dto.days,
        budget: dto.budget,
        source: 'ai',
        steps: steps.length ? { create: steps } : undefined,
      },
      include: { steps: { orderBy: [{ day: 'asc' }, { order: 'asc' }] } },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { aiCount: { increment: 1 } },
    });

    return trip;
  }
}
