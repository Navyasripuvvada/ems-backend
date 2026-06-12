import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { LeaveController } from './leaves.controller';
import { LeavesService } from './leaves.services';

import { Leave, LeaveSchema } from './schema/leaves.schema';
import { Employee,EmployeeSchema } from 'src/auth/schema/auth.schema';

@Module({
  imports: [

    MongooseModule.forFeature([
      { name: Leave.name, schema: LeaveSchema },
      { name:Employee.name,schema:EmployeeSchema},
    ]),
    JwtModule.registerAsync({
         imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              secret: configService.get<string>("JWT_SECRET"),
            }),
    })

  ],
  controllers: [LeaveController],
  providers: [LeavesService],
})
export class LeavesModule {}