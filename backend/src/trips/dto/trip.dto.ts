import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class StepDto {
  @IsString()
  type: string; // transport_main | transport_transfer | hotel | ticket | food | sight | other

  @IsString()
  title: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  day?: number;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  durationMin?: number;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

export class CreateTripDto {
  @IsString()
  title: string;

  @IsString()
  destination: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps?: StepDto[];
}

export class UpdateTripDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class SaveStepsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps: StepDto[];
}
