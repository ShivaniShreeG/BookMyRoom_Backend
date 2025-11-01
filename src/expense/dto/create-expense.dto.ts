import { IsNotEmpty, IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNumber()
  lodge_id: number;

  @IsNotEmpty()
  reason: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}

export class UpdateExpenseDto {
  @IsOptional()
  reason?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;
}
