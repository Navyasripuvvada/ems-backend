import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmployeeService } from './employee.services';

import { Employee, EmployeeSchema } from '../auth/schema/auth.schema';
import { EmployeeController } from './employee.controller';
import { MailModule } from '../mail/mail.module';
import { Leave,LeaveSchema } from 'src/leaves/schema/leaves.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Employee.name,
        schema: EmployeeSchema,
      },
      {
        name:Leave.name,
        schema:LeaveSchema,
      }
    ]),
      JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>("JWT_ACCESS_SECRET"),
    }),
}),
    MailModule,
  ],

  controllers: [EmployeeController],

  providers: [EmployeeService],

  exports: [EmployeeService],
})
export class EmployeeModule {}