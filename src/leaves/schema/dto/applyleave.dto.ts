import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ApplyLeaveDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsString()
  subject: string;

  
}