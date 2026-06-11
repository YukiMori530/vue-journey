import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ParseGuideDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(10000)
  text!: string;
}
