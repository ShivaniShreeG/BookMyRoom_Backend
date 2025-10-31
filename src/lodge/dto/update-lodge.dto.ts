import { IsOptional, IsString, IsEmail, IsBoolean } from 'class-validator';

export class UpdateLodgeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  logo?: string; // base64 string

  @IsOptional()
  duedate?: Date;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
