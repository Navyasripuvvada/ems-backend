import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';

export type EmployeeDocument = HydratedDocument<Employee>;
@Schema({
    timestamps: true,
})
export class Employee{
    @Prop({required: true,
        unique: true,
    })
    email:string;

    @Prop({required: true,
        trim:true,
    })
    password:string;

    @Prop({
        required:true,
        enum:['admin','employee'],
        default: 'employee',
    })
    role:string;

}
export const EmployeeSchema = SchemaFactory.createForClass(Employee);