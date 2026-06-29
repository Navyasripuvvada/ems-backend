import {
  Injectable,
  NotFoundException,BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WFHDocument,WFH } from './schema/wfh.schema';
import { ApplyWFHDto } from './dto/applywfh.dto';
import { Types } from 'mongoose';
import { WFHStatus } from './enum/wfh.enum';
import { Employee, EmployeeDocument } from '../auth/schema/auth.schema';
import { Attendance,AttendanceDocument } from '../attendance/schema/attendance.schema';
import { AttendanceStatus } from '../attendance/enum/attendance.enum';
import { UpdateWfhStatusDto } from './dto/updatewfh.dto';

@Injectable()
export class WFHService{
    constructor(
        @InjectModel(WFH.name)
        private WFHModel :Model<WFHDocument>,
        @InjectModel(Employee.name)
        private employeeModel :Model<EmployeeDocument>,

        @InjectModel(Attendance.name)
        private attendanceModel: Model<AttendanceDocument>,
    ){}
   async applyWFH(
        employeeId: string,
        applyWFHDto: ApplyWFHDto,
        ) {
        const fromDate = new Date(applyWFHDto.From);
        const toDate = new Date(applyWFHDto.to);

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

        const WFH = await this.WFHModel.create({
            employeeId: new Types.ObjectId(employeeId),
            reason:applyWFHDto.reason,
            From:fromDate,
            to:toDate,
            days,
            WfhStatus: WFHStatus.PENDING,
        });

        return {
            message: 'WFH applied successfully',
            WFH,
        };
    }

     async getAllWFH(status?: WFHStatus) {
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
                    WfhStatus: WFHStatus,
                },
                });
            }
    
            pipeline.push(
                {
                $project: {
                    reason: 1,
                    From: 1,
                    to: 1,
                    WfhStatus: 1,
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
    
            const data = await this.WFHModel.aggregate(pipeline);
    
            return {
                message: 'data successfully retrieved',
                data,
            };
            }
    async updateWfhStatus(
            updateWfhStatusDto: UpdateWfhStatusDto,
            WfhId: string,
            ) {
            const WFH = await this.WFHModel.findById(WfhId);

            if (!WFH) {
                throw new Error('Leave not found');
            }

            if (
                WFH.WfhStatus !== WFHStatus.APPROVED &&
                updateWfhStatusDto.WfhStatus === WFHStatus.APPROVED
            ) {
                const employee = await this.employeeModel.findById(
                WFH.employeeId,
                );

                if (!employee) {
                throw new Error('Employee not found');
                }

                const days =
                Math.ceil(
                    (WFH.to.getTime() - WFH.From.getTime()) /
                    (1000 * 60 * 60 * 24),
                ) + 1;


                await employee.save();
                let currentDate = new Date(WFH.From);
                const endDate = new Date(WFH.to);

                while (currentDate <= endDate) {
                const formattedDate =
                    currentDate.toISOString().split('T')[0];

                const existingAttendance =
                    await this.attendanceModel.findOne({
                    employeeId: WFH.employeeId,
                    date: formattedDate,
                    });

                if (!existingAttendance) {
                    await this.attendanceModel.create({
                    employeeId: WFH.employeeId,
                    date: formattedDate,
                    status: AttendanceStatus.WFH,
                    });
                }

                currentDate.setDate(currentDate.getDate() + 1);
                }
            }

            WFH.WfhStatus = updateWfhStatusDto.WfhStatus;

            await WFH.save();

            return {
                message: 'Leave status updated successfully',
                WFH,
            };
            }
 async getMyWFHHistory(employeeId: string) {
    const WFH = await this.WFHModel
        .find({  employeeId: new Types.ObjectId(employeeId) })
        .sort({ createdAt: -1 });

    const WFHHistory = WFH.map((WFH) => {
        const days =
        Math.ceil(
            (WFH.to.getTime() - WFH.From.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1;

        return {
        _id: WFH._id,
        reason: WFH.reason,
        From:WFH.From,
        to:WFH.to,
        days,
        WfhStatus: WFH.WfhStatus,
        createdAt: WFH.createdAt,
        };
    });

    return {
        
        WFH: WFHHistory,
    };
    }
}
