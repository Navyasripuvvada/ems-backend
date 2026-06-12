import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsDateString,
  Matches,
} from 'class-validator';
import { EmploymentType } from '../../auth/enum/employmenttype.enum';
import { Department } from '../../auth/enum/department.enum';
import { Designation } from '../../auth/enum/designation.enum';

export class AddEmployeeDto {
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
}