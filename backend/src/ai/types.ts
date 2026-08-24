/** AI 规划的类型定义（前后端共用结构） */

export type StepType =
  | 'transport_main'
  | 'transport_transfer'
  | 'hotel'
  | 'ticket'
  | 'food'
  | 'sight'
  | 'other';

export interface AiPlanItem {
  time: string;
  type: StepType;
  title: string;
  cost?: number;
  detail: string;
  cat: 'transport' | 'hotel' | 'ticket' | 'food' | 'other';
}

export interface AiDay {
  day: number;
  title: string;
  items: AiPlanItem[];
}

export interface AiPlan {
  id: 'time' | 'price' | 'balance';
  name: string;
  tagline: string;
  totalCost: number;
  totalKm: number;
  tripHours: number;
  transportHours: number;
  playHours: number;
  days: number;
  daily: AiDay[];
  budget: { transport: number; hotel: number; ticket: number; food: number; other: number };
  tips: string[];
  alternatives: string[];
}

export interface AiPlanResponse {
  input: AiPlanDto;
  title: string;
  plans: AiPlan[];
  generatedAt: string;
  source: 'deepseek' | 'mock';
}

export interface AiPlanDto {
  departure: string;
  destinations: string[];
  days: number;
  people: string;
  budget: string;
  preferences: string[];
}
