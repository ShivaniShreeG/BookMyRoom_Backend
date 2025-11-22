import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SpecificationDto {
  @IsNumber()
  number_of_days: number;

  @IsNumber()
  number_of_rooms: number;
}

export class CreateBookingDto {
  @IsNumber()
  lodge_id: number;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  alternate_phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  numberofguest: number;

  @ValidateNested()
  @Type(() => SpecificationDto)
  @IsOptional()
  specification?: SpecificationDto;

  @IsDate()
  @Type(() => Date)
  check_in: Date;

  @IsOptional()
  aadhar_number?: any; // accept string or array in controller


  @IsDate()
  @Type(() => Date)
  check_out: Date;

  @IsNumber()
  baseamount: number;

  @IsNumber()
  gst: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  advance: number;

  @IsNumber()
  balance: number; // frontend sends lowercase, will map in service

  @IsNumber()
  deposite: number;

  @IsString()
  room_name: string;

  @IsString()
  room_type: string;

  @IsArray()
  @IsString({ each: true })
  room_number: string[];

  @IsArray()
  @IsString({ each: true })
  id_proofs: string[]; // URLs after uploading
}
