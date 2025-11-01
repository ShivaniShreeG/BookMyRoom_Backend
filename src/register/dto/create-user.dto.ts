import { IsNotEmpty, IsEmail, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateLodgeOwnerDto {
  @IsNumber()
  lodge_id: number; // ✅ you’ll provide this manually

  @IsString()
  @IsNotEmpty()
  lodge_name: string;

  @IsString()
  @IsNotEmpty()
  lodge_phone: string;

  @IsEmail()
  lodge_email: string;

  @IsString()
  @IsNotEmpty()
  lodge_address: string;

  @IsString()
  @IsNotEmpty()
  user_id: string; // Prisma expects String, not Number

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  owner_name: string;

  @IsString()
  @IsNotEmpty()
  owner_phone: string;

  @IsEmail()
  owner_email: string;

  @IsOptional()
  @IsString()
  lodge_logo?: string;
}
