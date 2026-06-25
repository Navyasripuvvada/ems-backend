import {
  Injectable,
  BadRequestException,
  NotFoundException,

  
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument} from '../auth/schema/auth.schema';
import { Attendance,AttendanceDocument } from './schema/attendance.schema';
import { AttendanceStatus } from './enum/attendance.enum';
import { Types } from 'mongoose';
@Injectable()
export class AttendanceService{
   constructor(
    @InjectModel(Attendance.name)
    private attendanceModel :Model<AttendanceDocument>,

    @InjectModel(Employee.name)
    private employeeModel :Model<EmployeeDocument>

   ){}

 private calculateDistance(
  descriptor1: number[],//vector of current/live face
  descriptor2: number[],//stored vector of that employee
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

console.log('Face distance:', distance);

const THRESHOLD = 0.45;

if (distance > THRESHOLD) {
  throw new BadRequestException('Face does not match');
}
  const today = new Date()
    .toISOString()
    .split('T')[0];

  const existingAttendance =
    await this.attendanceModel.findOne({
       employeeId: new Types.ObjectId(employeeId),
      date: today,
    });

  if (existingAttendance) {
    throw new BadRequestException(
      'Attendance already marked today',
    );
  }

  const attendance =
    await this.attendanceModel.create({
      employeeId: new Types.ObjectId(employeeId),
      date: today,
      checkInTime: new Date(),
      status: AttendanceStatus.PRESENT,
    });

  return {
    message: 'Attendance marked successfully',
    attendance,
  };
}

// attendance.service.ts
async getAllAttendance(employeeId?: string, page = 1, limit = 10) {
  try {
    const match: any = {};

    if (employeeId) {
      match.employeeId = new Types.ObjectId(employeeId);
    }

    const skip = (page - 1) * limit;

    const data = await this.attendanceModel.aggregate([
      { $match: match },

      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },

      {
        $unwind: {
          path: '$employee',
          preserveNullAndEmptyArrays: true,
        },
      },

      { $sort: { date: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await this.attendanceModel.countDocuments(match);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err: any) {
    throw new BadRequestException(err.message);
  }
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

async getMonthlyAttendance(
  employeeId: string,
  month: number,
  year: number,
) {
  const startDate = new Date(year, month - 1, 1);

  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  const records = await this.attendanceModel.find({
    employeeId: new Types.ObjectId(employeeId),
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  const attendanceMap = new Map<number, AttendanceStatus>();

  records.forEach((record) => {
    const day = new Date(record.date).getDate();
    attendanceMap.set(day, record.status);
  });

  const totalDaysInMonth = new Date(year, month, 0).getDate();

  const today = new Date();

  let lastDayToShow = totalDaysInMonth;

  // For current month, show only until today
  if (
    year === today.getFullYear() &&
    month === today.getMonth() + 1
  ) {
    lastDayToShow = today.getDate();
  }

  const calendar: { day: number; status: AttendanceStatus }[] = [];

  for (let day = 1; day <= lastDayToShow; day++) {
    calendar.push({
      day,
      status: attendanceMap.get(day) || AttendanceStatus.LEAVE,
    });
  }

  return {
    month,
    year,
    totalDays: lastDayToShow,
    calendar,
  };
}
}