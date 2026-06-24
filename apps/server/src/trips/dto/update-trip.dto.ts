import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class TripStopDto {
  @IsString()
  name!: string;

  @IsOptional()
  lng?: number;

  @IsOptional()
  lat?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsString()
  tips?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;
}

class DayPlanDto {
  @IsInt()
  @Min(1)
  day!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(30)
  places!: Array<string | TripStopDto>;
}

export class UpdateTripDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  placeCount?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => DayPlanDto)
  dayPlans?: DayPlanDto[];
}
