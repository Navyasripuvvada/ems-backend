import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  Inject,NotFoundException,BadRequestException,
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
        private employeeModel :Model<EmployeeDocument>
    ){}
   async applyLeave(
        employeeId: string,
        applyLeaveDto: ApplyLeaveDto,
        ) {
        const fromDate = new Date(applyLeaveDto.fromDate);
        const toDate = new Date(applyLeaveDto.toDate);

        if (toDate < fromDate) {
            throw new BadRequestException(
            'To date cannot be earlier than From date',
            );
        }

        const days =
            Math.ceil(
            (toDate.getTime() - fromDate.getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1;

        const leave = await this.leaveModel.create({
            employeeId: new Types.ObjectId(employeeId),
            reason: applyLeaveDto.reason,
            fromDate,
            toDate,
            days,
            Leavestatus: LeavesStatus.PENDING,
        });

        return {
            message: 'Leave applied successfully',
            leave,
        };
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

    async updateLeaveStatus(
            updateLeaveStatusDto: UpdateLeaveStatusDto,
            leaveId: string,
            ) {
            const leave = await this.leaveModel.findById(leaveId);

            if (!leave) {
                throw new Error('Leave not found');
            }

            if (
                leave.Leavestatus !== LeavesStatus.APPROVED &&
                updateLeaveStatusDto.Leavestatus === LeavesStatus.APPROVED
            ) {
                const employee = await this.employeeModel.findById(
                leave.employeeId,
                );

                if (!employee) {
                throw new Error('Employee not found');
                }

                const days =
                Math.ceil(
                    (leave.toDate.getTime() - leave.fromDate.getTime()) /
                    (1000 * 60 * 60 * 24),
                ) + 1;

                employee.totalLeaves -= days;

                await employee.save();
            }

            leave.Leavestatus = updateLeaveStatusDto.Leavestatus;
            leave.adminComment = updateLeaveStatusDto.adminComment || '';

            await leave.save();

            return {
                message: 'Leave status updated successfully',
                leave,
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
    async getLeaveBalance(employeeId: string) {
    const employee = await this.employeeModel.findById(employeeId);

    if (!employee) {
        throw new NotFoundException('Employee not found');
    }

    return {
        employeeId: employee._id,
        fullName: employee.fullName,
        totalLeaves: employee.totalLeaves,
    };
    }
   async getMyLeaveHistory(employeeId: string) {
    const leaves = await this.leaveModel
        .find({  employeeId: new Types.ObjectId(employeeId) })
        .sort({ createdAt: -1 });

    const leaveHistory = leaves.map((leave) => {
        const days =
        Math.ceil(
            (leave.toDate.getTime() - leave.fromDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1;

        return {
        _id: leave._id,
        reason: leave.reason,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        days,
        status: leave.Leavestatus,
        adminComment: leave.adminComment,
        createdAt: leave.createdAt,
        };
    });

    return {
        totalLeaveRequests: leaveHistory.length,
        leaves: leaveHistory,
    };
    }
}

