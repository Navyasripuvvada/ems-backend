import { Controller, Post, Body,Get,Delete,Param,Put, Req, UseGuards,Query,ForbiddenException } from '@nestjs/common';
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
    addEmployee( @Req() req,@Body() addEmployeeDto: AddEmployeeDto){
          if (req.user.role !== 'admin') {
            throw new ForbiddenException('Only admin can view all leaves');
          }
        return this.adminService.addEmployee(addEmployeeDto);
    }

    @Post('set-password')
    setPassword(@Body() setPasswordDto: SetPasswordDto){
        return this.adminService.setPassword(setPasswordDto);
    }

    @Delete('delete-employee/:id')
    @UseGuards(JwtAuthGuard)
    async deleteEmployee(@Req() req ,@Param('id') employeeId: string) {
        if (req.user.role !== 'admin') {
            throw new ForbiddenException('Only admin can view all leaves');
          }
        return this.adminService.deleteEmployee(employeeId);
    }


    @Get('employees')
    @UseGuards(JwtAuthGuard)
    async getAllEmployees(@Req() req,@Query('status') status:Status){
         if (req.user.role !== 'admin') {
            throw new ForbiddenException('Only admin can view all leaves');
          }

        return this.adminService.getAllEmployees(status);
    }


    @Get('employee/:id')
    @UseGuards(JwtAuthGuard)
        async getEmployeeById(@Req() req,@Param('id') employeeId: string){
            if (req.user.role !== 'admin') {
            throw new ForbiddenException('Only admin can view all leaves');
          }
         return this.adminService.getEmployeeById(employeeId);
        }
    
    @Put('employee/:id')
    @UseGuards(JwtAuthGuard)
    async updateEmployee(@Req() req,@Param('id') employeeId:string ,@Body() updateEmployeeDto:UpdateEmployeeDto){
          if (req.user.role !== 'admin') {
            throw new ForbiddenException('Only admin can view all leaves');
          }
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
    @UseGuards(JwtAuthGuard)
    async getDashboardStats(@Req() req) {
         if (req.user.role !== 'admin') {
            throw new ForbiddenException('Only admin can view all leaves');
          }
    return this.adminService.getDashboardStats();
    }
    
    @Get('leaves/overview')
    @UseGuards(JwtAuthGuard)
    async LeavesOverview(@Req() req) {
         if (req.user.role !== 'admin') {
            throw new ForbiddenException('Only admin can view all leaves');
          }
    return this.adminService.LeavesOverview();
    }
    }


