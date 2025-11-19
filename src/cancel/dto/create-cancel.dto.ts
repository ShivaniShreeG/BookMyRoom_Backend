// src/cancels/dto/calculate-cancel.dto.ts
import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCancelDto {
  @IsInt()
  bookingId: number;

  @IsInt()
  lodgeId: number;

  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsNumber()
  cancelCharge?: number;

  @IsOptional()
  @IsNumber()
  refund?: number;
}
