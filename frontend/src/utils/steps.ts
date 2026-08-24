import type { StepType } from '../types';

export interface StepTypeConfig {
  type: StepType;
  label: string;
  icon: string;
  color: string; // tailwind 文本色
  bg: string; // tailwind 背景色
  border: string;
  fields: { key: string; label: string; placeholder: string; type?: 'text' | 'number' | 'time' }[];
}

export const STEP_TYPES: StepTypeConfig[] = [
  {
    type: 'transport_main',
    label: '交通（大交通）',
    icon: '🚆',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    fields: [
      { key: 'from', label: '出发地', placeholder: '成都东站', type: 'text' },
      { key: 'to', label: '目的地', placeholder: '黄龙九寨站', type: 'text' },
      { key: 'vehicle', label: '交通工具', placeholder: '高铁 / 飞机 / 大巴 / 自驾', type: 'text' },
      { key: 'departureTime', label: '出发时间', placeholder: '07:00', type: 'time' },
      { key: 'arrivalTime', label: '到达时间', placeholder: '09:00', type: 'time' },
      { key: 'ticketNo', label: '班次号', placeholder: 'G8888', type: 'text' },
      { key: 'distance', label: '里程(km)', placeholder: '340', type: 'number' },
    ],
  },
  {
    type: 'transport_transfer',
    label: '交通（接驳）',
    icon: '🚌',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    fields: [
      { key: 'from', label: '出发地', placeholder: '黄龙九寨站', type: 'text' },
      { key: 'to', label: '目的地', placeholder: '九寨沟沟口', type: 'text' },
      { key: 'vehicle', label: '交通工具', placeholder: '打车 / 公交 / 景区直通车', type: 'text' },
      { key: 'duration', label: '耗时(分钟)', placeholder: '120', type: 'number' },
    ],
  },
  {
    type: 'hotel',
    label: '住宿',
    icon: '🏨',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    fields: [
      { key: 'name', label: '酒店名称', placeholder: '九寨沟沟口酒店', type: 'text' },
      { key: 'address', label: '地址', placeholder: '漳扎镇', type: 'text' },
      { key: 'roomType', label: '房型', placeholder: '标间', type: 'text' },
      { key: 'nights', label: '入住晚数', placeholder: '1', type: 'number' },
      { key: 'pricePerNight', label: '价格/晚', placeholder: '140', type: 'number' },
      { key: 'orderNo', label: '订单号', placeholder: '选填', type: 'text' },
    ],
  },
  {
    type: 'ticket',
    label: '门票',
    icon: '🎫',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    fields: [
      { key: 'scenic', label: '景区名称', placeholder: '九寨沟', type: 'text' },
      { key: 'ticketType', label: '门票类型', placeholder: '全票 / 学生票', type: 'text' },
      { key: 'channel', label: '购票渠道', placeholder: '官方公众号', type: 'text' },
    ],
  },
  {
    type: 'food',
    label: '餐饮',
    icon: '🍜',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    fields: [
      { key: 'name', label: '餐厅名称', placeholder: '诺日朗中心午餐', type: 'text' },
      { key: 'time', label: '用餐时间', placeholder: '12:30', type: 'time' },
    ],
  },
  {
    type: 'sight',
    label: '景点游览',
    icon: '🗺️',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    fields: [
      { key: 'remark', label: '备注', placeholder: '金顶看日出，2小时', type: 'text' },
    ],
  },
  {
    type: 'other',
    label: '其他',
    icon: '📦',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    fields: [
      { key: 'remark', label: '备注', placeholder: '氧气瓶、雨衣等', type: 'text' },
    ],
  },
];

export function getStepTypeConfig(type: StepType): StepTypeConfig {
  return STEP_TYPES.find((t) => t.type === type) || STEP_TYPES[STEP_TYPES.length - 1];
}

/** 步骤成本字段：不同步骤类型的金额来源 */
export function stepCostKey(type: StepType): string {
  switch (type) {
    case 'hotel':
      return 'pricePerNight';
    case 'ticket':
    case 'transport_main':
    case 'transport_transfer':
    case 'food':
    case 'other':
      return 'cost';
    default:
      return 'cost';
  }
}

export function fmtMoney(n?: number | null): string {
  if (n === null || n === undefined) return '—';
  return `¥${Math.round(n)}`;
}

export function fmtDate(d?: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
}

export function fmtDuration(min?: number | null): string {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}小时${m}分`;
  if (h) return `${h}小时`;
  return `${m}分钟`;
}

export function dayLabel(day: number): string {
  return `Day ${day}`;
}
