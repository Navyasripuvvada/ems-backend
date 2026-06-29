import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { WFHService } from './wfh.services';
import { WFHController } from './wfh.controller';
import { WFH,WFHSchema } from './schema/wfh.schema';
import { Employee,EmployeeSchema } from '../auth/schema/auth.schema';
import { Attendance,AttendanceSchema } from '../attendance/schema/attendance.schema';

@Module({
  imports: [

    MongooseModule.forFeature([
      { name: WFH.name, schema: WFHSchema },
      { name:Employee.name,schema:EmployeeSchema},
      {name:Attendance.name,schema:AttendanceSchema},
    ]),
    JwtModule.registerAsync({
         imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              secret: configService.get<string>("JWT_ACCESS_SECRET"),
            }),
    })

  ],
  controllers: [WFHController],
  providers: [WFHService],
})
export class WFHModule {}