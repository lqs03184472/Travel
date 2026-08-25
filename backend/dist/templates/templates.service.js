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
var TemplatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const SEED_TEMPLATES = [
    {
        title: '九寨沟3日游',
        destination: '九寨沟',
        days: 3,
        description: '成都出发，高铁+大巴，学生党友好，含黄龙九寨站接驳与沟口住宿',
        tags: ['自然风光', '高性价比'],
        coverColor: '#0891b2',
        steps: [
            { type: 'transport_main', title: '成都东→黄龙九寨站（高铁）', day: 1, startTime: '07:00', cost: 140, durationMin: 120, details: { from: '成都东站', to: '黄龙九寨站', vehicle: '高铁', distance: 340 } },
            { type: 'transport_transfer', title: '黄龙九寨站→九寨沟沟口（大巴）', day: 1, startTime: '12:00', cost: 50, durationMin: 120, details: { from: '黄龙九寨站', to: '九寨沟沟口', vehicle: '景区直通车', distance: 90 } },
            { type: 'hotel', title: '沟口酒店（经济标间）', day: 1, cost: 140, details: { name: '九寨沟沟口酒店', address: '漳扎镇', pricePerNight: 140, roomType: '标间', nights: 1 } },
            { type: 'sight', title: '沟口自由活动，适应海拔', day: 1, durationMin: 120, details: { remark: '晚上早点休息，为第二天进沟保存体力' } },
            { type: 'ticket', title: '九寨沟门票+观光车（学生票）', day: 2, startTime: '08:00', cost: 180, durationMin: 540, details: { scenic: '九寨沟', ticketType: '学生票', channel: '官方公众号' } },
            { type: 'food', title: '诺日朗中心午餐', day: 2, cost: 50, details: { name: '诺日朗游客中心', pricePerPerson: 50, time: '12:30' } },
            { type: 'sight', title: '则查洼沟→日则沟→树正沟经典路线', day: 2, durationMin: 360, details: { remark: '长海、五彩池、五花海、珍珠滩瀑布' } },
            { type: 'transport_main', title: '九寨沟沟口→黄龙九寨站（大巴）', day: 3, startTime: '08:00', cost: 50, durationMin: 120, details: { from: '九寨沟沟口', to: '黄龙九寨站', vehicle: '大巴' } },
            { type: 'transport_main', title: '黄龙九寨站→成都东（高铁）', day: 3, startTime: '12:00', cost: 140, durationMin: 120, details: { from: '黄龙九寨站', to: '成都东站', vehicle: '高铁', distance: 340 } },
        ],
    },
    {
        title: '峨眉山2日游',
        destination: '峨眉山',
        days: 2,
        description: '成都出发，看金顶日出，索道+大巴串联，含学生优惠',
        tags: ['自然风光', '人文历史'],
        coverColor: '#16a34a',
        steps: [
            { type: 'transport_main', title: '成都东→峨眉山站（高铁）', day: 1, startTime: '08:00', cost: 55, durationMin: 70, details: { from: '成都东站', to: '峨眉山站', vehicle: '高铁', distance: 156 } },
            { type: 'transport_transfer', title: '高铁站→山脚报国寺（打车）', day: 1, startTime: '10:00', cost: 20, durationMin: 30, details: { from: '峨眉山站', to: '报国寺', vehicle: '打车' } },
            { type: 'hotel', title: '山脚酒店', day: 1, cost: 120, details: { name: '峨眉山山脚酒店', pricePerNight: 120, roomType: '标间', nights: 1 } },
            { type: 'ticket', title: '峨眉山门票（大学生票）', day: 2, startTime: '06:30', cost: 40, durationMin: 480, details: { scenic: '峨眉山', ticketType: '学生票', channel: '景区官网' } },
            { type: 'sight', title: '金顶看日出+云海', day: 2, startTime: '08:00', durationMin: 120, details: { remark: '雷洞坪乘观光车+金顶索道上行，务必早起' } },
            { type: 'ticket', title: '金顶索道下行', day: 2, cost: 50, details: { scenic: '金顶索道', ticketType: '下行', channel: '景区内购买' } },
            { type: 'food', title: '雷洞坪午餐（豆花饭）', day: 2, cost: 30, details: { name: '雷洞坪小吃', pricePerPerson: 30 } },
            { type: 'transport_transfer', title: '山脚→峨眉山站（大巴）', day: 2, startTime: '16:00', cost: 20, durationMin: 60, details: { from: '报国寺', to: '峨眉山站', vehicle: '旅游大巴' } },
            { type: 'transport_main', title: '峨眉山→成都（高铁）', day: 2, startTime: '17:30', cost: 60, durationMin: 70, details: { from: '峨眉山站', to: '成都东站', vehicle: '高铁', distance: 156 } },
        ],
    },
    {
        title: '成都市区美食2日游',
        destination: '成都',
        days: 2,
        description: '太古里、宽窄巷子、人民公园，吃遍成都特色小吃',
        tags: ['美食探店', '懒人休闲'],
        coverColor: '#ea580c',
        steps: [
            { type: 'sight', title: '宽窄巷子+奎星楼街', day: 1, startTime: '10:00', durationMin: 240, details: { remark: '网红小吃打卡' } },
            { type: 'food', title: '奎星楼街午餐（冒菜/串串）', day: 1, cost: 45, details: { name: '冒椒火辣', pricePerPerson: 45, time: '12:30' } },
            { type: 'sight', title: '人民公园鹤鸣茶社', day: 1, startTime: '15:00', durationMin: 180, details: { remark: '盖碗茶+掏耳朵，体验成都慢生活' } },
            { type: 'food', title: '建设路小吃街晚餐', day: 1, cost: 50, details: { name: '建设路小吃街', pricePerPerson: 50, time: '18:30' } },
            { type: 'sight', title: '大熊猫繁育研究基地', day: 2, startTime: '07:30', durationMin: 240, details: { remark: '早上看熊猫最活跃，需提前购票' } },
            { type: 'ticket', title: '大熊猫基地门票', day: 2, cost: 55, details: { scenic: '成都大熊猫繁育研究基地', ticketType: '全票', channel: '官方公众号' } },
            { type: 'food', title: '太古里午餐（钟水饺/甜水面）', day: 2, cost: 40, details: { name: '龙抄手', pricePerPerson: 40, time: '12:30' } },
            { type: 'sight', title: '太古里+IFS逛拍', day: 2, startTime: '14:00', durationMin: 180, details: { remark: 'IFS爬墙熊猫打卡' } },
        ],
    },
    {
        title: '重庆山城夜景2日游',
        destination: '重庆',
        days: 2,
        description: '洪崖洞、解放碑、长江索道、磁器口，轻轨穿楼',
        tags: ['特种兵打卡', '人文历史'],
        coverColor: '#7c3aed',
        steps: [
            { type: 'sight', title: '解放碑步行街+八一好吃街', day: 1, startTime: '10:00', durationMin: 240, details: { remark: '午饭在好吃街解决' } },
            { type: 'food', title: '八一好吃街午餐', day: 1, cost: 40, details: { name: '八一好吃街', pricePerPerson: 40, time: '12:00' } },
            { type: 'sight', title: '长江索道（单程）', day: 1, startTime: '15:00', cost: 20, durationMin: 60, details: { remark: '选南岸→北岸方向人更少' } },
            { type: 'sight', title: '洪崖洞夜景', day: 1, startTime: '19:00', durationMin: 180, details: { remark: '千厮门大桥是绝佳机位' } },
            { type: 'sight', title: '李子坝轻轨穿楼+鹅岭二厂', day: 2, startTime: '09:00', durationMin: 240, details: { remark: '轻轨2号线直达' } },
            { type: 'food', title: '磁器口古镇午餐（毛血旺）', day: 2, cost: 60, details: { name: '磁器口古镇', pricePerPerson: 60, time: '12:30' } },
            { type: 'sight', title: '磁器口古镇', day: 2, startTime: '13:30', durationMin: 180, details: { remark: '古镇+嘉陵江边' } },
        ],
    },
];
let TemplatesService = TemplatesService_1 = class TemplatesService {
    prisma;
    logger = new common_1.Logger(TemplatesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        const count = await this.prisma.template.count();
        if (count === 0) {
            for (const t of SEED_TEMPLATES) {
                await this.prisma.template.create({
                    data: {
                        title: t.title,
                        destination: t.destination,
                        days: t.days,
                        description: t.description,
                        tags: JSON.stringify(t.tags),
                        coverColor: t.coverColor,
                        steps: t.steps,
                    },
                });
            }
            this.logger.log(`已初始化 ${SEED_TEMPLATES.length} 个官方模板`);
        }
    }
    list() {
        return this.prisma.template.findMany({ orderBy: { createdAt: 'asc' } });
    }
    async getOne(id) {
        const t = await this.prisma.template.findUnique({ where: { id } });
        if (!t)
            throw new common_1.NotFoundException('模板不存在');
        return t;
    }
    async apply(userId, templateId) {
        const t = await this.getOne(templateId);
        const steps = t.steps;
        const createSteps = steps.map((s, i) => ({
            type: s.type,
            title: s.title,
            day: s.day || 1,
            order: i,
            startTime: s.startTime,
            cost: s.cost,
            durationMin: s.durationMin,
            details: (s.details || {}),
        }));
        const trip = await this.prisma.trip.create({
            data: {
                userId,
                title: t.title,
                destination: t.destination,
                days: t.days,
                source: 'template',
                steps: createSteps.length ? { create: createSteps } : undefined,
            },
            include: { steps: { orderBy: { order: 'asc' } } },
        });
        return trip;
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = TemplatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map