import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,

  
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument} from '../auth/schema/auth.schema';
import { Attendance,AttendanceDocument } from './schema/attendance.schema';
import { AttendanceStatus } from './enum/attendance.enum';
@Injectable()
export class AttendanceService{
   constructor(
    @InjectModel(Attendance.name)
    private attendanceModel :Model<AttendanceDocument>,

    @InjectModel(Employee.name)
    private employeeModel :Model<EmployeeDocument>

   ){}

 private calculateDistance(
  descriptor1: number[],
  descriptor2: number[],
): number {
  let sum = 0;

  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(
      descriptor1[i] - descriptor2[i],
      2,
    );
  }

  return Math.sqrt(sum);
}

async markAttendance(
  employeeId: string,
  currentDescriptor: number[],
) {
  const employee = await this.employeeModel.findById(employeeId);

  if (!employee) {
    throw new NotFoundException('Employee not found');
  }

  if (!employee.isFaceRegistered) {
    throw new BadRequestException(
      'Face not registered',
    );
  }

  if (
    !employee.faceDescriptor ||
    employee.faceDescriptor.length === 0
  ) {
    throw new BadRequestException(
      'Employee face descriptor not found',
    );
  }

  if (
    !currentDescriptor ||
    currentDescriptor.length === 0
  ) {
    throw new BadRequestException(
      'Face descriptor is required',
    );
  }

  if (
    employee.faceDescriptor.length !==
    currentDescriptor.length
  ) {
    throw new BadRequestException(
      'Invalid face descriptor',
    );
  }

  const distance = this.calculateDistance(
    employee.faceDescriptor,
    currentDescriptor,
  );

  console.log('Distance:', distance);

  if (distance > 0.6) {
    throw new BadRequestException(
      'Face does not match',
    );
  }

  const today = new Date()
    .toISOString()
    .split('T')[0];

  const existingAttendance =
    await this.attendanceModel.findOne({
      employeeId,
      date: today,
    });

  if (existingAttendance) {
    throw new BadRequestException(
      'Attendance already marked today',
    );
  }

  const attendance =
    await this.attendanceModel.create({
      employeeId,
      date: today,
      checkInTime:
        new Date().toLocaleTimeString(),
      status: AttendanceStatus.PRESENT,
    });

  return {
    message: 'Attendance marked successfully',
    attendance,
  };
}

async getAllAttendance(employeeId?: string, date?: string) {
  const filter: any = {};

  if (employeeId) {
    filter.employeeId = employeeId;
  }

  if (date) {
    filter.date = date;
  }

  return this.attendanceModel
    .find(filter)
    .populate('employeeId', 'fullName email role')
    .sort({ createdAt: -1 });
}
async getMyAttendance(employeeId: string) {
  const attendance = await this.attendanceModel
    .find({ employeeId })
    .sort({ date: -1 });

  return {
    message: 'Attendance fetched successfully',
    attendance,
  };
}
}