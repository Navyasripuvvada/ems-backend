import { Post,UseGuards,Req,Controller,Body,Get,Query,ForbiddenException} from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { JwtAuthGuard } from "src/admin/guards/admin.guard";

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService:AttendanceService){}
  
   @Post('mark')
    @UseGuards(JwtAuthGuard)
    async markAttendance(
    @Req() req,
    @Body('faceDescriptor') faceDescriptor: number[],
    ) {
    return this.attendanceService.markAttendance(
        req.user.sub,
        faceDescriptor,
    );
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    async getAllAttendance(
    @Query('employeeId') employeeId?: string,
    @Query('date') date?: string,
    ) {
    return this.attendanceService.getAllAttendance(
        employeeId,
        date,
    );
    }
    @Get('my')
    @UseGuards(JwtAuthGuard)
    async getMyAttendance(@Req() req) {
    if (req.user.role !== 'admin') {
        throw new ForbiddenException('Only admin can update leave status');
    }
    return this.attendanceService.getMyAttendance(
        req.user.sub,
    );
    }

@Get("monthly")
@UseGuards(JwtAuthGuard)
async getMonthlyAttendance(
  @Req() req,
  @Query("month") month: number,
  @Query("year") year: number,
) {
  console.log("req.user =", req.user);

  const employeeId = req.user.sub;

  console.log("employeeId =", employeeId);
  console.log("month =", month);
  console.log("year =", year);

  return this.attendanceService.getMonthlyAttendance(
    employeeId,
    Number(month),
    Number(year),
  );
}
}