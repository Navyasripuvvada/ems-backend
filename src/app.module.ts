import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import {ConfigModule} from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { EmployeeModule } from './employee/employee.module';
import { LeavesModule } from './leaves/leaves.module';
import { AttendanceModule } from './attendance/attendance.module';


@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGO_URI');

        console.log('MONGO_URI =', mongoUri);

        return {
          uri: mongoUri,
        };
      },
    }),
    AuthModule,
    AdminModule,
    EmployeeModule,
    LeavesModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule {}
