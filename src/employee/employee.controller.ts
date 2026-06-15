import { Controller, Post, Body,Get,Delete,Param,Put, UseGuards,Req } from '@nestjs/common';
import { EmployeeService } from './employee.services';

import { JwtAuthGuard } from 'src/admin/guards/admin.guard';
@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService:EmployeeService){}

    @Get("profile")
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req){
        return this.employeeService.getEmployeeProfile(req.user.sub)
    }
      @Get('dashboard')
        @UseGuards(JwtAuthGuard)
        async getDashboard(@Req() req) {
            return this.employeeService.getEmployeeDashboard(
            req.user.sub,
            );
        }
}