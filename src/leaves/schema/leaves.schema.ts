import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LeavesStatus } from '../leavesenum/leave.enum'; 

export type LeaveDocument = HydratedDocument<Leave>;

@Schema({ timestamps: true })
export class Leave {

 
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  // leave details
  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  fromDate: Date;

  @Prop({ required: true })
  toDate: Date;

  @Prop({
    type: String,
    enum: Object.values(LeavesStatus),
    default: LeavesStatus.PENDING,
  })
  Leavestatus: LeavesStatus;

  @Prop({ default: '' })
  adminComment: string;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);