import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PlanItineraryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  destination!: string;

  @IsInt()
  @Min(1)
  @Max(30)
  days!: number;

  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  preferences!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  rawQuery?: string;
}
