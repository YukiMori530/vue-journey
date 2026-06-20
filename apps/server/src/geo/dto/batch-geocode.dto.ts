import { ArrayMinSize, IsArray, IsString, MinLength } from 'class-validator';

export class BatchGeocodeDto {
  @IsString()
  @MinLength(1)
  destination!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  places!: string[];
}
