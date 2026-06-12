import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Employee, EmployeeDocument} from './schema/auth.schema';
import {LoginDto} from './dto/login.dto';
import { Role } from '../commom/enum/role.enum';
import { EmploymentType } from './enum/employmenttype.enum';
import { Designation } from './enum/designation.enum';
import { Department } from './enum/department.enum';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
  ) {}

 
  async onModuleInit() {
    const adminExists = await this.employeeModel.findOne({ role: 'admin' });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await this.employeeModel.create({
         fullName: "Admin User",
          department:Department.HR,
          designation: Designation.PRODUCT_MANAGER,
          employmentType: EmploymentType.FULL_TIME,
          dateOfJoining: new Date(),
          phoneNumber: 1234567890,
          email: "admin2@gmail.com",
          password: hashedPassword,
          role:'admin',
      });

      console.log(' Default Admin Created');
    }
  }

  async login(dto: LoginDto) {
    const employee = await this.employeeModel.findOne({
      email: dto.email,
    });

    if (!employee) {
      throw new UnauthorizedException('Invalid credentials');
    }

   
    const isMatch = await bcrypt.compare(
      dto.password,
      employee.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: employee._id,
      email: employee.email,
      role: employee.role,
      
    };

    const token = await this.jwtService.signAsync(payload,{
                secret: process.env.JWt_SCERET,
                expiresIn: "1d",
                },);

    return {
      message: 'Login successful',
      token: token,
      role: employee.role,
    };
  }
}