import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsDateString,
  Matches,
  IsNumber, 
  IsDate,IsOptional,
} from 'class-validator';
import { EmploymentType } from '../../auth/enum/employmenttype.enum';
import { Department } from '../../auth/enum/department.enum';
import { Designation } from '../../auth/enum/designation.enum';
import { Status } from '../../auth/enum/status.enum';
import { Gender } from '../../auth/enum/gender.enum';
import { Type } from 'class-transformer';

export class UpdateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, {
    message: 'Phone number must be 10 digits',
  })
  phoneNumber: number;

  @IsNotEmpty()
  @IsDateString()
  dateOfJoining: Date;

  @IsNotEmpty()
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsNotEmpty()
  @IsEnum(Department)
  department: Department;

  @IsNotEmpty()
  @IsEnum(Designation)
  designation: Designation;

  @IsEnum(['admin', 'employee'])
  role: string;

  @IsNotEmpty()
  @IsEnum(Status)
  status:Status;

  @IsNumber()
  salary:Number;

 @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;

  @IsString()
  address:string;

   @IsEnum(Gender)
  gender: Gender;

   @IsString()
   profilePicture?: string; 

}