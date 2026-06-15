import {Injectable, BadRequestException,NotFoundException} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';

import { Employee,EmployeeDocument } from 'src/auth/schema/auth.schema';
import { Leave,LeaveDocument } from 'src/leaves/schema/leaves.schema';
import { LeavesStatus } from 'src/leaves/leavesenum/leave.enum';
@Injectable()
export class EmployeeService{
    constructor(
        @InjectModel(Employee.name)
        private readonly employeeModel: Model<EmployeeDocument>,
        @InjectModel(Leave.name)
       private readonly leaveModel: Model<LeaveDocument>,){}

async getEmployeeProfile(employeeId: string) {
  try {
    const employee = await this.employeeModel
      .findById(employeeId)
      .select('-password');

    if (!employee) {
      throw new BadRequestException('no employee found');
    }

    const leaves = await this.leaveModel.find({
      employeeId: new Types.ObjectId(employeeId),
    });

    return {
      message: 'Profile fetched successfully',
      employee,
      leaves,
    };
  } catch (error: any) {
    throw new BadRequestException(error.message);
  }
}

async getEmployeeDashboard(employeeId: string) {
  const employee = await this.employeeModel.findById(employeeId);
  if (!employee) {
  throw new NotFoundException('Employee not found');
}

  const approvedLeaves = await this.leaveModel.aggregate([
    {
      $match: {
        employeeId: new Types.ObjectId(employeeId),
        Leavestatus: LeavesStatus.APPROVED,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$days' },
      },
    },
  ]);

  const pendingRequests = await this.leaveModel.countDocuments({
    employeeId: new Types.ObjectId(employeeId),
    Leavestatus: LeavesStatus.PENDING,
  });

  const leavesTaken = approvedLeaves[0]?.total || 0;

  return {
    totalLeaves: 20,
    leavesTaken,
    remainingLeaves: employee.totalLeaves,
    pendingRequests,
  };
}
}