import { Controller, Post, Body,Get,Delete,Param,Put, UseGuards,Req,UseInterceptors,UploadedFile } from '@nestjs/common';
import { EmployeeService } from './employee.services';

import { JwtAuthGuard } from 'src/admin/guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { faceUploadConfig } from 'src/commom/config/multer.config';
import { profilePictureUploadConfig } from 'src/commom/config/profile_picture.config';


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
        key: string;
        faceDescriptor: number[];
    },
    ) {
    return this.employeeService.registerFace(
        req.user.sub,
        body.key,
        body.faceDescriptor,
    );
    }



   @Post('upload-profile-picture')
    @UseGuards(JwtAuthGuard)
    async uploadProfilePicture(
    @Req() req,
    @Body() body: { key: string },
    ) {
    return this.employeeService.uploadProfilePicture(
        req.user.sub,
        body.key,
    );
    }
}