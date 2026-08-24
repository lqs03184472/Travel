import { AiPlan, AiPlanDto, AiPlanItem } from './types';

/** 目的地词匹配 */
function has(text: string, keys: string[]) {
  return keys.some((k) => text.includes(k));
}

type LibItem = Omit<AiPlanItem, 'cost'> & { cost?: number; cat: AiPlanItem['cat'] };

const DEST_LIB: Record<
  string,
  {
    name: string;
    km: number;
    ticketInfo: string;
    tips: string[];
    alternatives: string[];
    days: LibItem[][];
  }
> = {
  jiuzhaigou: {
    name: '九寨沟',
    km: 900,
    ticketInfo: '学生票180元（含观光车），全票280元；旺季需提前预约',
    tips: ['九寨沟海拔约2000-3000米，注意高反，避免剧烈运动', '早晚温差大，务必带厚外套', '沟内午餐可在诺日朗中心解决', '10月中下旬至11月初是红叶最佳观赏期'],
    alternatives: ['若九寨沟临时闭园，可改道黄龙景区或牟尼沟', '若沟内遇雨，可优先走则查洼沟，雨停再游树正沟'],
    days: [
      [
        { time: '07:00', type: 'transport_main', title: '出发地→黄龙九寨站（高铁）', cost: 140, cat: 'transport', detail: '高铁约2小时，二等座参考价140元' },
        { time: '12:00', type: 'transport_transfer', title: '黄龙九寨站→九寨沟沟口（大巴）', cost: 50, cat: 'transport', detail: '景区直通车，约2小时' },
        { time: '15:00', type: 'hotel', title: '沟口酒店入住', cost: 140, cat: 'hotel', detail: '漳扎镇经济标间，140元/晚' },
        { time: '19:00', type: 'sight', title: '沟口自由活动，适应海拔', cat: 'other', detail: '晚上早点休息，为第二天进沟保存体力' },
      ],
      [
        { time: '08:00', type: 'ticket', title: '九寨沟门票+观光车', cost: 180, cat: 'ticket', detail: '学生票180元，官方公众号提前购票' },
        { time: '08:30', type: 'sight', title: '则查洼沟：长海、五彩池', cat: 'other', detail: '观光车直达长海，步行到五彩池' },
        { time: '12:30', type: 'food', title: '诺日朗中心午餐', cost: 50, cat: 'food', detail: '自助餐/盒饭，人均50元' },
        { time: '14:00', type: 'sight', title: '日则沟：五花海、珍珠滩瀑布', cat: 'other', detail: '九寨沟精华段，拍照机位多' },
        { time: '16:30', type: 'sight', title: '树正沟：树正群海、犀牛海', cat: 'other', detail: '出沟前最后一段，人少景美' },
      ],
      [
        { time: '08:00', type: 'transport_transfer', title: '九寨沟沟口→黄龙九寨站（大巴）', cost: 50, cat: 'transport', detail: '约2小时' },
        { time: '12:00', type: 'transport_main', title: '黄龙九寨站→成都东（高铁）', cost: 140, cat: 'transport', detail: '返程高铁，约2小时' },
      ],
    ],
  },
  emeishan: {
    name: '峨眉山',
    km: 320,
    ticketInfo: '大学生票40元，全票160元；金顶索道上下行各50-65元',
    tips: ['看日出需住山顶或凌晨4点出发', '山顶气温低，带冲锋衣/羽绒服', '峨眉山猴子多，食物放包里不要拎着', '学生证+身份证才能享受学生票'],
    alternatives: ['若金顶因天气封闭，可改游万年寺-清音阁-生态猴区线', '遇大雾日出看不到，可改游报国寺、伏虎寺'],
    days: [
      [
        { time: '08:00', type: 'transport_main', title: '出发地→峨眉山站（高铁）', cost: 55, cat: 'transport', detail: '高铁约70分钟' },
        { time: '10:00', type: 'transport_transfer', title: '高铁站→山脚报国寺（打车）', cost: 20, cat: 'transport', detail: '约30分钟' },
        { time: '11:00', type: 'hotel', title: '山脚酒店入住', cost: 120, cat: 'hotel', detail: '报国寺附近标间，120元/晚' },
        { time: '14:00', type: 'sight', title: '报国寺、伏虎寺游览', cat: 'other', detail: '山脚古刹，佛寺文化初体验' },
      ],
      [
        { time: '06:30', type: 'ticket', title: '峨眉山门票（大学生票）', cost: 40, cat: 'ticket', detail: '记得带学生证' },
        { time: '07:00', type: 'sight', title: '雷洞坪→金顶（观光车+索道）', cost: 120, cat: 'ticket', detail: '观光车+索道上行' },
        { time: '09:00', type: 'sight', title: '金顶：十方普贤、云海日出', cat: 'other', detail: '金顶海拔3079米，注意保暖' },
        { time: '12:30', type: 'food', title: '雷洞坪午餐（豆花饭）', cost: 30, cat: 'food', detail: '当地特色' },
        { time: '14:00', type: 'ticket', title: '金顶索道下行', cost: 50, cat: 'ticket', detail: '原路返回' },
        { time: '16:00', type: 'transport_transfer', title: '山脚→峨眉山站（大巴）', cost: 20, cat: 'transport', detail: '旅游大巴约1小时' },
        { time: '17:30', type: 'transport_main', title: '峨眉山→成都（高铁）', cost: 60, cat: 'transport', detail: '返程' },
      ],
    ],
  },
  chengdu: {
    name: '成都',
    km: 100,
    ticketInfo: '大熊猫基地全票55元，学生半价；都江堰80元',
    tips: ['大熊猫基地务必早上去，熊猫上午最活跃', '火锅排队时间长，提前取号', '市区地铁覆盖广，下载天府通扫码乘车', '宽窄巷子偏游客化，奎星楼街更local'],
    alternatives: ['若大熊猫基地人多，可改去熊猫谷（都江堰）', '雨天改室内：四川博物院、金沙遗址博物馆'],
    days: [
      [
        { time: '10:00', type: 'sight', title: '宽窄巷子+奎星楼街', cat: 'other', detail: '逛老成都巷子，奎星楼街吃小吃' },
        { time: '12:30', type: 'food', title: '奎星楼街午餐（串串/冒菜）', cost: 45, cat: 'food', detail: '人均45元' },
        { time: '15:00', type: 'sight', title: '人民公园鹤鸣茶社', cat: 'other', detail: '盖碗茶+掏耳朵，体验慢生活' },
        { time: '18:30', type: 'food', title: '建设路小吃街晚餐', cost: 50, cat: 'food', detail: '人均50元' },
      ],
      [
        { time: '07:30', type: 'ticket', title: '大熊猫繁育研究基地', cost: 55, cat: 'ticket', detail: '早去人少，熊猫最活跃' },
        { time: '12:00', type: 'food', title: '太古里午餐（钟水饺/甜水面）', cost: 40, cat: 'food', detail: '龙抄手等老字号' },
        { time: '14:00', type: 'sight', title: '太古里+IFS爬墙熊猫打卡', cat: 'other', detail: '拍照机位' },
        { time: '17:00', type: 'sight', title: '锦里古街夜景', cat: 'other', detail: '三国文化+小吃' },
      ],
    ],
  },
  chongqing: {
    name: '重庆',
    km: 300,
    ticketInfo: '长江索道单程20元；洪崖洞免费；三峡博物馆免费',
    tips: ['重庆是山城，穿舒适的鞋', '洪崖洞夜景最佳机位在千厮门大桥', '长江索道选南岸→北岸方向人少', '轻轨2号线可体验李子坝穿楼'],
    alternatives: ['若洪崖洞限流，可去对岸江北嘴看夜景', '下雨天改室内：重庆中国三峡博物馆、816工程'],
    days: [
      [
        { time: '10:00', type: 'sight', title: '解放碑步行街+八一好吃街', cat: 'other', detail: '重庆地标+小吃' },
        { time: '12:00', type: 'food', title: '八一好吃街午餐', cost: 40, cat: 'food', detail: '人均40元' },
        { time: '15:00', type: 'ticket', title: '长江索道（单程）', cost: 20, cat: 'ticket', detail: '横跨长江' },
        { time: '19:00', type: 'sight', title: '洪崖洞夜景', cat: 'other', detail: '千厮门大桥机位最佳' },
      ],
      [
        { time: '09:00', type: 'sight', title: '李子坝轻轨穿楼+鹅岭二厂', cat: 'other', detail: '2号线直达' },
        { time: '12:30', type: 'food', title: '磁器口午餐（毛血旺）', cost: 60, cat: 'food', detail: '古镇特色' },
        { time: '13:30', type: 'sight', title: '磁器口古镇', cat: 'other', detail: '嘉陵江边的千年古镇' },
      ],
    ],
  },
};

/** 通用兜底行程生成器 */
function genericDest(dest: string, days: number): LibItem[][] {
  const items: (Omit<AiPlanItem, 'cost'> & { cost?: number; cat: AiPlanItem['cat'] })[][] = [];
  const firstDay = [
    { time: '08:00', type: 'transport_main' as const, title: `出发地→${dest}（高铁/飞机）`, cost: 200, cat: 'transport' as const, detail: '首选高铁，出站后打车/公交到市区' },
    { time: '14:00', type: 'hotel' as const, title: `${dest}市区酒店入住`, cost: 150, cat: 'hotel' as const, detail: '市中心交通便利，150元/晚' },
    { time: '15:30', type: 'sight' as const, title: `${dest}市区地标打卡`, cat: 'other' as const, detail: '老城街区+夜市' },
  ];
  items.push(firstDay);
  for (let d = 2; d <= Math.max(2, days - 1); d++) {
    items.push([
      { time: '09:00', type: 'sight' as const, title: `${dest}核心景点（第${d}天）`, cat: 'other' as const, detail: '提前在官方渠道购票，早去避开人流' },
      { time: '12:00', type: 'food' as const, title: `${dest}本地特色午餐`, cost: 50, cat: 'food' as const, detail: '大众点评高分店，人均50元' },
      { time: '14:00', type: 'sight' as const, title: `${dest}周边景点/博物馆`, cat: 'other' as const, detail: '室内外结合，视天气调整' },
    ]);
  }
  items.push([
    { time: '09:00', type: 'sight' as const, title: `${dest}剩余景点/自由活动`, cat: 'other' as const, detail: '逛街买伴手礼' },
    { time: '14:00', type: 'transport_main' as const, title: `${dest}→出发地（返程）`, cost: 200, cat: 'transport' as const, detail: '按返程车次时间安排' },
  ]);
  return items;
}

/** 根据 budget 档位生成三套差异化方案 */
export function buildMockPlans(input: AiPlanDto): { title: string; plans: AiPlan[] } {
  const dest = input.destinations[0] || '目的地';
  const libKey = has(dest, ['九寨沟', '黄龙'])
    ? 'jiuzhaigou'
    : has(dest, ['峨眉'])
      ? 'emeishan'
      : has(dest, ['成都'])
        ? 'chengdu'
        : has(dest, ['重庆'])
          ? 'chongqing'
          : null;
  const lib = libKey ? DEST_LIB[libKey] : null;
  const rawDays = lib ? lib.days : genericDest(dest, input.days);
  const budgetLevel = input.budget === 'luxury' ? 1.6 : input.budget === 'comfort' ? 1.0 : 0.7;
  const destName = lib ? lib.name : dest;

  const variants = [
    {
      id: 'time' as const,
      name: '时间最优方案',
      tagline: '最快路线 · 索道/直飞优先 · 住宿离景区最近',
      transM: 1.8,
      hotelM: 1.5,
      hotelName: '景区门口舒适型酒店',
    },
    {
      id: 'price' as const,
      name: '价格最优方案',
      tagline: '大巴/火车为主 · 经济住宿 · 学生票/淡季优惠',
      transM: 0.7,
      hotelM: 0.6,
      hotelName: '经济型酒店/青旅',
    },
    {
      id: 'balance' as const,
      name: '平衡推荐方案',
      tagline: '时间与价格均衡 · 高性价比',
      transM: 1.0,
      hotelM: 1.0,
      hotelName: '舒适经济型酒店',
    },
  ];

  const plans: AiPlan[] = variants.map((v) => {
    let totalCost = 0;
    const budget = { transport: 0, hotel: 0, ticket: 0, food: 0, other: 0 };
    let tripHours = 0;
    let transportHours = 0;

    const daily = rawDays.map((dayItems, idx) => {
      const items = dayItems.map((it) => {
        let cost: number | undefined = it.cost;
        if (cost) {
          if (it.type === 'transport_main' || it.type === 'transport_transfer') cost = Math.round(cost * v.transM * budgetLevel);
          else if (it.type === 'hotel') cost = Math.round(cost * v.hotelM * budgetLevel);
          else cost = Math.round(cost * budgetLevel);
        }
        const cat = it.cat as AiPlanItem['cat'];
        if (cost) {
          totalCost += cost;
          budget[cat] = (budget[cat] || 0) + cost;
        }
        tripHours += 2;
        if (it.type === 'transport_main' || it.type === 'transport_transfer') transportHours += 2;
        return { time: it.time, type: it.type, title: it.title, cost, detail: it.detail, cat: it.cat };
      });
      return { day: idx + 1, title: dayItems[0]?.title || `Day ${idx + 1}`, items };
    });

    // 补足天数：如行程少于输入天数，提示可延长
    const days = Math.max(input.days, daily.length);

    return {
      id: v.id,
      name: v.name,
      tagline: v.tagline,
      totalCost: Math.round(totalCost),
      totalKm: lib ? Math.round(lib.km * (v.id === 'time' ? 1.05 : v.id === 'price' ? 0.95 : 1)) : Math.round(300 * (v.id === 'price' ? 0.9 : 1)),
      tripHours: Math.round(tripHours),
      transportHours: Math.round(transportHours),
      playHours: Math.round(Math.max(0, tripHours - transportHours)),
      days,
      daily,
      budget,
      tips: lib
        ? lib.tips
        : ['提前在官方渠道购买门票', '下载当地地铁/公交App', '酒店建议选在市中心或景区门口，省交通时间', '出行前查天气，备好雨具和防晒'],
      alternatives: lib ? lib.alternatives : ['如核心景点临时关闭，可替换为当地博物馆/室内场馆'],
    };
  });

  const peopleMap: Record<string, string> = { single: '单人', couple: '情侣', family: '家庭', friends: '朋友' };
  const title = `${destName}${input.days}天${input.days - 1}夜 ${peopleMap[input.people] || input.people}${input.preferences.length ? '·' + input.preferences.slice(0, 2).join('+') : ''}之旅`;
  return { title, plans };
}
