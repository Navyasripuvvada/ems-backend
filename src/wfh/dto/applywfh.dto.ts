import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ApplyWFHDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsDateString()
  From: Date;

  @IsDateString()
  to: Date;

  @IsString()
  subject:string;

  

  
}