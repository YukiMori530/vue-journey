import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class ChatTripDto {
  @IsInt()
  tripId!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  message!: string;
}
