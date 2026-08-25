"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_mock_1 = require("./ai.mock");
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
let AiService = class AiService {
    prisma;
    config;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async plan(userId, dto) {
        const apiKey = this.config.get('DEEPSEEK_API_KEY');
        if (apiKey) {
            try {
                const res = await this.planWithDeepSeek(dto);
                return { ...res, input: dto, generatedAt: new Date().toISOString(), source: 'deepseek' };
            }
            catch (e) {
                console.warn('[AI] DeepSeek 调用失败，降级为内置演示数据:', e.message);
            }
        }
        const mock = (0, ai_mock_1.buildMockPlans)(dto);
        return { ...mock, input: dto, generatedAt: new Date().toISOString(), source: 'mock' };
    }
    async planWithDeepSeek(dto) {
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
        if (!content)
            throw new Error('DeepSeek 返回内容为空');
        const parsed = JSON.parse(content);
        return { title: parsed.title || 'AI 智能规划', plans: parsed.plans || [] };
    }
    async adopt(userId, dto) {
        const steps = [];
        const CAT_MAP = {
            transport: '交通',
            hotel: '住宿',
            ticket: '门票',
            food: '餐饮',
            other: '其他',
        };
        for (const day of dto.plan.daily) {
            day.items.forEach((it, i) => {
                steps.push({
                    type: it.type,
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
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map