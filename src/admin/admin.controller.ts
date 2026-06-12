import { Controller, Post, Body,Get,Delete,Param,Put, UseGuards,Query } from '@nestjs/common';
import { AdminService } from './admin.services';
import { AddEmployeeDto } from './dto/addEmployee.dto';
import { SetPasswordDto } from './dto/setpassword.dto';
import { UpdateEmployeeDto } from './dto/updateemployee.dto';
import { Department } from 'src/auth/enum/department.enum';
import { Status } from 'src/auth/enum/status.enum';
import { JwtAuthGuard } from './guards/admin.guard';
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService){}
  
    @Post('add-employee')
    @UseGuards(JwtAuthGuard)
    addEmployee(@Body() addEmployeeDto: AddEmployeeDto){
        return this.adminService.addEmployee(addEmployeeDto);
    }

    @Post('set-password')
    setPassword(@Body() setPasswordDto: SetPasswordDto){
        return this.adminService.setPassword(setPasswordDto);
    }

    @Delete('delete-employee/:id')
    @UseGuards(JwtAuthGuard)
    async deleteEmployee(@Param('id') employeeId: string) {
        return this.adminService.deleteEmployee(employeeId);
    }


    @Get('employees')
    @UseGuards(JwtAuthGuard)
    async getAllEmployees(@Query('status') status:Status){
        return this.adminService.getAllEmployees(status);
    }


    @Get('employee/:id')
    @UseGuards(JwtAuthGuard)
        async getEmployeeById(@Param('id') employeeId: string){
         return this.adminService.getEmployeeById(employeeId);
        }
    
    @Put('employee/:id')
    @UseGuards(JwtAuthGuard)
    async updateEmployee(@Param('id') employeeId:string ,@Body() updateEmployeeDto:UpdateEmployeeDto){
        return this.adminService.updateEmployee(employeeId,updateEmployeeDto)
    }

    @Get('employees/department/:department')
    @UseGuards(JwtAuthGuard)
    async getEmployeesByDepartment(@Param('department') department:Department){
        return this.adminService.getEmployeesByDepartment(department)
    }

    @Get('employees/status/:status')
    @UseGuards(JwtAuthGuard)
    async getEmployeesByStatus(@Param('status') status:Status){
         console.log("STATUS FROM URL:", status);
        return this.adminService.getEmployeesByStatus(status)
    }
   @Get('dashboard')
    async getDashboardStats() {
    return this.adminService.getDashboardStats();
    }
    
    }


