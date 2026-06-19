import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AttendanceController } from './attendance.controller';

import { Employee, EmployeeSchema } from '../auth/schema/auth.schema';
import { AttendanceService } from './attendance.service';
import { Attendance,AttendanceSchema } from './schema/attendance.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Employee.name,
        schema: EmployeeSchema,
      },
      {
        name: Attendance.name,
        schema: AttendanceSchema,
      },
    ]),
      JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>("JWT_ACCESS_SECRET"),
    }),
}),
   
  ],

  controllers: [AttendanceController],

  providers: [AttendanceService],

  exports: [AttendanceService],
})
export class AttendanceModule {}