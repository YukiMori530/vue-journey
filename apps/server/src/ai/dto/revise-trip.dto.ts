import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class ReviseTripDto {
  @IsInt()
  @Min(1)
  tripId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message!: string;
}
