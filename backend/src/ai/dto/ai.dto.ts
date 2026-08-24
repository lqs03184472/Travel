import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class AiPlanDto {
  @IsString()
  departure: string; // 出发城市

  @IsArray()
  @IsString({ each: true })
  destinations: string[]; // 目的地（支持多目的地串联）

  @IsNumber()
  @Min(1)
  days: number; // 出行天数

  @IsString()
  people: string; // 单人 | 情侣 | 家庭 | 朋友

  @IsString()
  budget: string; // economic | comfort | luxury

  @IsArray()
  @IsString({ each: true })
  preferences: string[]; // 偏好标签
}

class AdoptItemDto {
  @IsString()
  time?: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsString()
  detail?: string;
}

class AdoptDayDto {
  @IsNumber()
  day: number;

  @IsString()
  title?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdoptItemDto)
  items: AdoptItemDto[];
}

export class AdoptPlanDto {
  @IsString()
  title: string;

  @IsString()
  destination: string;

  @IsNumber()
  days: number;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsString()
  planName?: string;

  @IsObject()
  plan: {
    daily: AdoptDayDto[];
    budget?: Record<string, number>;
  };
}
