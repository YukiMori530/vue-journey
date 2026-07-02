import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ReviseTripDto {
  @IsInt()
  @Min(1)
  tripId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message!: string;

  /** 用户当前查看/编辑的天数，scope=day 时生效 */
  @IsOptional()
  @IsInt()
  @Min(1)
  focusDay?: number;

  /** day=仅改指定天；trip=允许改整趟行程 */
  @IsOptional()
  @IsIn(['day', 'trip'])
  scope?: 'day' | 'trip';
}
