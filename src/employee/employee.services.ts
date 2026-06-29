import {Injectable, BadRequestException,NotFoundException} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';

import { Employee,EmployeeDocument } from '../auth/schema/auth.schema';
import { Leave,LeaveDocument } from '../leaves/schema/leaves.schema';
import { LeavesStatus } from '../leaves/leavesenum/leave.enum';

import cloudinary from '../commom/config/cloudinary';

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

  const totalLeaves = 15; 

  return {
    totalLeaves,
    leavesTaken,
    remainingLeaves: totalLeaves - leavesTaken,
    pendingRequests,
  };
}
//Register face
async registerFace(
  employeeId: string,
   imageUrl:string,
  descriptor: number[],
) {
  const employee =
    await this.employeeModel.findById(employeeId);

  if (!employee) {
    throw new NotFoundException(
      'Employee not found',
    );
  }

  if (
    employee.isFaceRegistered ||
    (employee.faceDescriptor &&
      employee.faceDescriptor.length > 0)
  ) {
    throw new BadRequestException(
      'Face already registered for this employee',
    );
  }

  if (!descriptor || descriptor.length !== 128) {
    throw new BadRequestException(
      'Invalid face descriptor',
    );
  }
 


  employee.faceImage =  imageUrl;
  employee.faceDescriptor = descriptor;
  employee.isFaceRegistered = true;

  await employee.save();

  return {
    message: 'Face registered successfully',
    faceImage:  imageUrl,
  };
}
async uploadProfilePicture(
  employeeId: string,
  file: Express.Multer.File,
) {
  const employee =
    await this.employeeModel.findById(employeeId);

  if (!employee) {
    throw new NotFoundException(
      'Employee not found',
    );
  }

   const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'profile-pictures',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          resolve(result);
        },
      );

      stream.end(file.buffer);
    });

   
    employee.profilePicture = uploadResult.secure_url;
    await employee.save();

  return {
    message:
      'Profile picture updated successfully',
    profilePicture:uploadResult.secure_url,
  };
}
}