import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Leave,LeaveDocument } from './schema/leaves.schema';
import { ApplyLeaveDto } from './schema/dto/applyleave.dto';
import { Types } from 'mongoose';
import { LeavesStatus } from './leavesenum/leave.enum';
import { Employee, EmployeeDocument } from 'src/auth/schema/auth.schema';
import { UpdateLeaveStatusDto } from './schema/dto/updateleave.dto';

@Injectable()
export class LeavesService{
    constructor(
        @InjectModel(Leave.name)
        private leaveModel :Model<LeaveDocument>,
        @InjectModel(Employee.name)
        private emploeeModel :Model<EmployeeDocument>
    ){}
    async applyLeave(employeeId:string,applyLeaveDto:ApplyLeaveDto,){
        const leave = await this.leaveModel.create({
            employeeId : new Types.ObjectId(employeeId),
            reason: applyLeaveDto.reason,
            fromDate: applyLeaveDto.fromDate,
            toDate: applyLeaveDto.toDate,
            Leavestatus: LeavesStatus.PENDING,
        

        })
        return {message:'leave applied successfully',leave}

    }
   async getAllLeaves(status?: LeavesStatus) {
        const pipeline: any[] = [
            {
            $lookup: {
                from: 'employees',
                localField: 'employeeId',
                foreignField: '_id',
                as: 'employeeDetails',
            },
            },
            {
            $unwind: '$employeeDetails',
            },
        ];

        if (status) {
            pipeline.push({
            $match: {
                Leavestatus: status,
            },
            });
        }

        pipeline.push(
            {
            $project: {
                reason: 1,
                fromDate: 1,
                toDate: 1,
                Leavestatus: 1,
                adminComment: 1,
                createdAt: 1,
                'employeeDetails.email': 1,
                'employeeDetails.name': 1,
                'employeeDetails.role': 1,
            },
            },
            {
            $sort: {
                createdAt: -1,
            },
            },
        );

        const data = await this.leaveModel.aggregate(pipeline);

        return {
            message: 'data successfully retrieved',
            data,
        };
        }

    async updateLeaveStatus(updateLeaveStatusDto:UpdateLeaveStatusDto,leaveId: string,) {
        const result = await this.leaveModel.findByIdAndUpdate(
            leaveId,
            {
            Leavestatus: updateLeaveStatusDto.Leavestatus,
            adminComment: updateLeaveStatusDto.adminComment || '',
            },
            { new: true }, // returns updated document
        );

        if (!result) {
            throw new Error('Leave not found');
        }

        return {
            message: 'Leave status updated successfully',
            leave: result,
        };
        }

        async searchLeaves(search: string) {
            return this.leaveModel.aggregate([
                {
                $lookup: {
                    from: 'employees',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'employee',
                },
                },
                {
                $unwind: '$employee',
                },
                {
                $match: {
                    $or: [
                    {
                        'employee.name': {
                        $regex: search,
                        $options: 'i',
                        },
                    },
                    {
                        'employee.email': {
                        $regex: search,
                        $options: 'i',
                        },
                    },
                    {
                        'employee.role': {
                        $regex: search,
                        $options: 'i',
                        },
                    },
                    ],
                },
                },
                {
                $project: {
                    reason: 1,
                    fromDate: 1,
                    toDate: 1,
                    Leavestatus: 1,
                    adminComment: 1,
                    createdAt: 1,
                    'employee.name': 1,
                    'employee.email': 1,
                    'employee.role': 1,
                },
                },
            ]);
            }
}

