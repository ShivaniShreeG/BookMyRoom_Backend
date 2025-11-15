import { IsNumber, IsString, IsOptional, IsNotEmpty } from "class-validator";

export class CalculatePricingDto {
  
  @IsNumber()
  lodge_id: number;

  @IsString()
  @IsNotEmpty()
  room_name: string;

  @IsString()
  @IsNotEmpty()
  room_type: string;

  @IsString()
  @IsNotEmpty()
  check_in: string;     // ISO datetime

  @IsString()
  @IsNotEmpty()
  check_out: string;    // ISO datetime

  @IsNumber()
  room_count: number;

  @IsOptional()
  @IsNumber()
  override_base_amount?: number; // optional from frontend
}
