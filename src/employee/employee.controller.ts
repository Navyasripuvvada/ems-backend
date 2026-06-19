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
    @UseInterceptors(FileInterceptor('image', faceUploadConfig))
    async registerFace(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('faceDescriptor') faceDescriptor: string,
    ) {
    return this.employeeService.registerFace(
        req.user.sub,
        file,
        JSON.parse(faceDescriptor),
    );
    }



    @Post('upload-profile-picture')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
    FileInterceptor(
        'profilePicture',
        profilePictureUploadConfig,
    ),
    )
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