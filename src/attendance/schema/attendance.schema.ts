import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AttendanceStatus } from '../enum/attendance.enum';

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  checkInTime: string;

  @Prop()
  checkOutTime: string;

 @Prop({
    type:String,
  enum: AttendanceStatus,
  default: AttendanceStatus.PRESENT,
    })
   status: AttendanceStatus;
}

export const AttendanceSchema =
  SchemaFactory.createForClass(Attendance);