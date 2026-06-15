import {
  Injectable,
  UnauthorizedException,
  BadRequestException,

  
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument} from '../auth/schema/auth.schema';
import { AddEmployeeDto } from './dto/addEmployee.dto';
import {randomBytes} from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { SetPasswordDto } from './dto/setpassword.dto';
import { UpdateEmployeeDto } from './dto/updateemployee.dto';
import { Department } from 'src/auth/enum/department.enum';
import { Status } from 'src/auth/enum/status.enum';
import { Leave,LeaveDocument } from 'src/leaves/schema/leaves.schema';
import { LeavesStatus } from 'src/leaves/leavesenum/leave.enum';


@Injectable()
export class AdminService{
    constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<EmployeeDocument>,
     @InjectModel(Leave.name)
    private readonly leaveModel: Model<LeaveDocument>,
     private readonly mailService: MailService,
    ){}

    async addEmployee(addEmployeeDto: AddEmployeeDto){
        try{
        const existingEmployee = await this.employeeModel.findOne({email:addEmployeeDto.email})
        if(existingEmployee){
            throw new UnauthorizedException('Employee with this email already exists');
        }
        const token = randomBytes(32).toString('hex');
        const newEmployee = await this.employeeModel.create({...addEmployeeDto, password: '', passwordSetupToken: token,
             passwordSetupTokenExpiry: new Date( Date.now() + 24 * 60 * 60 * 1000,),
            });
             console.log('Before sending mail');

            await this.mailService.sendPasswordSetupEmail(newEmployee.email, newEmployee.fullName, token);
            console.log('Before sending mail');

        return{
            message:"employee added successfully", newEmployee
        }

        }catch(error: any){
            throw new BadRequestException(error.message);

        }

    }
 

    async setPassword(setPasswordDto: SetPasswordDto) {
    const employee = await this.employeeModel.findOne({
        passwordSetupToken: setPasswordDto.token,
    });

    if (!employee) {
        throw new BadRequestException('Invalid token');
    }

    
    if (
        employee.passwordSetupTokenExpiry &&
        employee.passwordSetupTokenExpiry < new Date()
    ) {
        throw new BadRequestException('Token has expired');
    }

    
    if (
        setPasswordDto.password !==
        setPasswordDto.confirmPassword
    ) {
        throw new BadRequestException(
        'Passwords do not match',
        );
    }

    
    employee.password = await bcrypt.hash(
        setPasswordDto.password,
        10,
    );


    employee.passwordSetupToken = null;
    employee.passwordSetupTokenExpiry = null;


    await employee.save();

    return {
        message: 'Password set successfully',
    };
    }
    async deleteEmployee(employeeId: string) {
        try{
            const deletedEmployee = await this.employeeModel.findByIdAndDelete(employeeId);
            if(!deletedEmployee){
                throw new BadRequestException('Employee not found');
            }
            return{
                message:"Employee deleted successfully"
            }

        }catch(error:any){
            throw new BadRequestException({ message: 'Error occurred while updating employee',
    error: error.message,});
        }

    }
    async getAllEmployees(status:Status){
        try{
            const filter:any = {};
            if(status){
                filter.status = status;

            }
            const employees = await this.employeeModel.find(filter);
            return{
                message:"employees retrieved successfully", employees
            }
        }catch(error:any){
            throw new BadRequestException('Error occurred while retrieving employees');
        }
    }

    async getEmployeeById(employeeId: string){
        try{
            const employee = await this.employeeModel.findById(employeeId);
            if(!employee){
                throw new BadRequestException('Employee not found');
            }
            return{
                message:"Employee retrieved successfully",employee
            }
        }catch(error:any){
            throw new BadRequestException('Error occurred while retrieving employee');
        }
    }

    async updateEmployee(employeeId: string, updateData: UpdateEmployeeDto){
        try{
            const updateEmployee =  await this.employeeModel.findByIdAndUpdate(employeeId, updateData, {new: true});
            if(!updateEmployee){
                throw new BadRequestException('Employee not found');
            }
            return{
                message:"Employee updated successfully", updateEmployee
            }
        }catch(error:any){
            throw new BadRequestException({ message: 'Error occurred while updating employee',
    error: error.message,});
        }
    }
    async getEmployeesByDepartment(department:Department){
        try{
            const  result =  await this.employeeModel.find({department})
            if(result.length==0){
                throw new BadRequestException("department not found")
            }
            return{
                message:"data fetched succesfully" , result
            }
        }catch(error:any){
            throw new BadRequestException(error.message)

        }
    }

    async getEmployeesByStatus(status:Status){
        try{
            const employees =  await this.employeeModel.find({status})
            if(employees.length==0){
                throw new BadRequestException("Status not found")
            }
            return {message:"data fetched successfully",employees}
        }catch(error:any){
           throw new BadRequestException(error.message)
        }
    }
        async getDashboardStats() {
        const totalEmployees =
            await this.employeeModel.countDocuments();

        const pendingLeaves = await this.leaveModel.countDocuments({
            Leavestatus: LeavesStatus.PENDING,
        });

            const approvedLeaves = await this.leaveModel.countDocuments({
            Leavestatus: LeavesStatus.APPROVED,
        });

            const rejectedLeaves = await this.leaveModel.countDocuments({
            Leavestatus: LeavesStatus.REJECT,
        });

        return {
            totalEmployees,
            pendingLeaves,
            approvedLeaves,
            rejectedLeaves,
        };
        }
      async LeavesOverview() {
       

        const pendingLeaves = await this.leaveModel.countDocuments({
            Leavestatus: LeavesStatus.PENDING,
        });

            const approvedLeaves = await this.leaveModel.countDocuments({
            Leavestatus: LeavesStatus.APPROVED,
        });

            const rejectedLeaves = await this.leaveModel.countDocuments({
            Leavestatus: LeavesStatus.REJECT,
        });

        return {
            pendingLeaves,
            approvedLeaves,
            rejectedLeaves,
        };
        }

}