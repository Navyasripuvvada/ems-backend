import { Schema,SchemaFactory,Prop } from "@nestjs/mongoose";
import { HydratedDocument,Types } from "mongoose";
import { WFHStatus } from "../enum/wfh.enum";
export type WFHDocument = HydratedDocument<WFH>;
@Schema({timestamps:true})
export class WFH{
  createdAt?: Date;
  updatedAt?: Date;

  @Prop({type : Types.ObjectId ,ref:'Employee', required:true})
  employeeId:Types.ObjectId;

  @Prop({required:true})
  From:Date;

  @Prop({required:true})
  to:Date;

  @Prop({required:true})
  reason:string;

  @Prop({})
  days:number;

  @Prop({
    type:String,
    enum:Object.values(WFHStatus),
    default:WFHStatus.PENDING
    })
   WfhStatus:WFHStatus

   @Prop({ })
   subject:String;



}
export const WFHSchema = SchemaFactory.createForClass(WFH) 