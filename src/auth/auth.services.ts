import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Employee, EmployeeDocument} from './schema/auth.schema';
import {LoginDto} from './dto/login.dto';
import { EmploymentType } from './enum/employmenttype.enum';
import { Designation } from './enum/designation.enum';
import { Department } from './enum/department.enum';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
     private mailService: MailService,
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
    name: employee.fullName,
    role: employee.role,
  };
//access token is here token
  const token = await this.jwtService.signAsync(payload, {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '15m',
  });

  
  const refreshToken = await this.jwtService.signAsync(
    { sub: employee._id },
    {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    },
  );


  employee.refreshToken = refreshToken;
  await employee.save();

  return {
    message: 'Login successful',
    token,
    refreshToken,
    role: employee.role,
    name: employee.fullName,
  };
}

async refreshToken(token: string) {
  try {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const employee = await this.employeeModel.findById(decoded.sub);

    if (!employee || employee.refreshToken !== token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = {
      sub: employee._id,
      email: employee.email,
      role: employee.role,
      name: employee.fullName,
    };

    const newToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    return {
      token: newToken,
    };
  } catch (err) {
    throw new UnauthorizedException('Token expired or invalid');
  }
}
 async forgotPassword(email: string) {
  const employee = await this.employeeModel.findOne({
    email,
  });

  if (!employee) {
    throw new NotFoundException(
      'Employee not found',
    );
  }

  const token = crypto.randomBytes(32).toString('hex');

  employee.resetPasswordToken = token;
  employee.resetPasswordExpires = new Date(
    Date.now() + 60 * 60 * 1000,
  );

  await employee.save();

  await this.mailService.sendResetPasswordEmail(
    employee.email,
    employee.fullName,
    token,
  );

  return {
    message: 'Password reset link sent successfully',
    token
  };
}
async resetPassword(
  token: string,
  newPassword: string,
) {
  const employee = await this.employeeModel.findOne({
    resetPasswordToken: token,
  });

  if (!employee) {
    throw new BadRequestException(
      'Invalid reset token',
    );
  }

  if (
    employee.resetPasswordExpires &&
    employee.resetPasswordExpires < new Date()
  ) {
    throw new BadRequestException(
      'Reset token has expired',
    );
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10,
  );

  employee.password = hashedPassword;

  employee.resetPasswordToken = undefined;
  employee.resetPasswordExpires = undefined;

  await employee.save();

  return {
    message: 'Password reset successfully',
  };
}
}