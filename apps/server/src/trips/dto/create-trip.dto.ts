import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class DayPlanDto {
  @IsInt()
  @Min(1)
  day!: number;

  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(30)
  @IsString({ each: true })
  places!: string[];
}

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  destination!: string;

  @IsInt()
  @Min(0)
  @Max(30)
  days!: number;

  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  preferences!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  nights?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  placeCount?: number;

  @IsOptional()
  @IsUrl()
  cover?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  theme?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => DayPlanDto)
  dayPlans?: DayPlanDto[];
}
