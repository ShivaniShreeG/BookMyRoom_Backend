import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdatePricingDto {
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
  pricing_type: string;   // "NORMAL" or "PEAK_HOUR"

  @IsNumber()
  room_count: number;

  @IsString()
  check_in: string;

  @IsString()
  check_out: string;
}
