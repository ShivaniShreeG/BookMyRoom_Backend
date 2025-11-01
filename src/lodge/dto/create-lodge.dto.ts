import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateLodgeDto {
  @IsOptional()
  @IsInt()
  lodge_id?: number;


  @IsString()
  @IsNotEmpty()
  name: string;

 
  @IsString()
  @IsNotEmpty()
  phone: string;

  
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  logo?: string; // base64 string
}
