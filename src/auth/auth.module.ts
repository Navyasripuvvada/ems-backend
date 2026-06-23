import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';

import { Employee, EmployeeSchema } from './schema/auth.schema';
import { AuthService } from './auth.services';
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
      secret: configService.get<string>("JWT_ACCESS_SECRET"),
    }),
}),MailModule
  ],

  controllers: [AuthController],

  providers: [AuthService],

  exports: [AuthService,JwtModule,],
})
export class AuthModule {}