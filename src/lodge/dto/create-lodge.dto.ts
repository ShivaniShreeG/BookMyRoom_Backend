import { IsOptional, IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateLodgeDto {
  @IsOptional()
  lodge_id?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  logo?: string; // base64 string for image
}
