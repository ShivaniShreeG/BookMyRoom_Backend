import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateLodgeDto {
  
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  logo?: string; // base64 string

  @IsOptional()
  @IsDateString()
  duedate?: Date;
}
