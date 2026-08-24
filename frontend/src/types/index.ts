// 步骤类型
export type StepType =
  | 'transport_main'
  | 'transport_transfer'
  | 'hotel'
  | 'ticket'
  | 'food'
  | 'sight'
  | 'other';

export interface TripStep {
  id: string;
  tripId: string;
  day: number;
  order: number;
  type: StepType;
  title: string;
  startTime?: string | null;
  endTime?: string | null;
  durationMin?: number | null;
  cost?: number | null;
  details: Record<string, any>;
  createdAt?: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate?: string | null;
  endDate?: string | null;
  days: number;
  budget?: number | null;
  isPublic: boolean;
  source: 'manual' | 'ai' | 'template';
  userId: string;
  createdAt: string;
  updatedAt: string;
  steps: TripStep[];
  summary?: {
    totalCost: number;
    stepCount: number;
    dayCount: number;
    budget: Record<string, number>;
  };
  user?: { nickname: string };
}

export interface Template {
  id: string;
  title: string;
  destination: string;
  days: number;
  description?: string;
  tags: string[];
  coverColor: string;
  steps: TripStep[];
}

// AI 规划
export interface AiPlanItem {
  time: string;
  type: StepType;
  title: string;
  cost?: number;
  detail: string;
  cat?: string;
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
  budget: Record<string, number>;
  tips: string[];
  alternatives: string[];
}

export interface AiPlanResponse {
  input: AiPlanInput;
  title: string;
  plans: AiPlan[];
  generatedAt: string;
  source: 'deepseek' | 'mock';
}

export interface AiPlanInput {
  departure: string;
  destinations: string[];
  days: number;
  people: string;
  budget: string;
  preferences: string[];
}

export interface User {
  id: string;
  email?: string | null;
  phone?: string | null;
  nickname?: string | null;
  avatar?: string | null;
  aiCount: number;
  tripCount?: number;
  favoriteCount?: number;
}

export interface UserStats {
  tripCount: number;
  totalCost: number;
  totalDays: number;
  totalKm: number;
  aiCount: number;
}
