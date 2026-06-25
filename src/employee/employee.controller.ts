import { Controller, Post, Body,Get, UseGuards,Req,UseInterceptors,UploadedFile } from '@nestjs/common';
import { EmployeeService } from './employee.services';

import { JwtAuthGuard } from '../admin/guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';



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



@Post('register-face')
@UseGuards(JwtAuthGuard)
async registerFace(
  @Req() req,
  @Body()
  body: {
    imageUrl: string;
    faceDescriptor: number[];
  },
) {
  return this.employeeService.registerFace(
    req.user.sub,
    body.imageUrl,
    body.faceDescriptor,
  );
}


 @Post('upload-profile-picture')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file'))
async uploadProfilePicture(
  @Req() req,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.employeeService.uploadProfilePicture(
    req.user.sub,
    file,
  );
}
}
