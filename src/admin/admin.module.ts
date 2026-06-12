import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {AdminController} from './admin.controller';

import { Employee, EmployeeSchema } from '../auth/schema/auth.schema';
import { AdminService } from './admin.services';
import { MailModule } from '../mail/mail.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Employee.name,
        schema: EmployeeSchema,
      },
    ]),
      JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get<string>("JWT_SECRET"),
    }),
}),
    MailModule,
  ],

  controllers: [AdminController],

  providers: [AdminService],

  exports: [AdminService],
})
export class AdminModule {}