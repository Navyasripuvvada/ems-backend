import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';
import {Designation} from '../enum/designation.enum';
import {Department} from '../enum/department.enum';
import {EmploymentType} from '../enum/employmenttype.enum';
import { Status } from '../enum/status.enum';
import { Gender } from '../enum/gender.enum';

export type EmployeeDocument = HydratedDocument<Employee>;
@Schema({
    timestamps: true,
})
export class Employee{
    @Prop({required: true,
        unique: true,
    })
    email:string;

    @Prop({required: false,
        default: '',
    })
    password:string;

    @Prop({
        required:true,
        trim:true,
    })
    fullName:string;


    @Prop({
        required:true,
    })
    phoneNumber:Number;

    @Prop({
        required:true,
    })
    dateOfJoining:Date;

    @Prop({
        type: String,
        required:true,
        enum:Object.values(EmploymentType),
    })
    employmentType: EmploymentType;


    @Prop({
        required:true,
        enum:['admin','employee'],
        default: 'employee',
    })
    role:string;


    @Prop({
        required: true,
        enum: Object.values(Department),
    })
    department: Department;

    @Prop({
        required: true,
        enum: Object.values(Designation),
    })
    designation: Designation;

    @Prop({
            type: String,
            default: null,
    })
    passwordSetupToken: string|null;

    @Prop({
        type: Date,
        default: null,
    })
    passwordSetupTokenExpiry: Date | null;

    
    @Prop({
       type:String,
       enum: Object.values(Status),
        default: Status.ACTIVE,
    })
    status:Status;

    @Prop({
        type: Number,
        required: true,
        default: 0,
    })
    salary: number;

    @Prop({
        type:String,
    })
    address:string|null;

    @Prop({
    })
    dateOfBirth:Date;

   @Prop({
    type: String,
    enum: Object.values(Gender),
    })
    gender: Gender;

   @Prop({ default: 15 })
   totalLeaves: number;

}
export const EmployeeSchema = SchemaFactory.createForClass(Employee);