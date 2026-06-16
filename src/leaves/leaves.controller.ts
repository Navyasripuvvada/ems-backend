import { Controller, Post,Put,Param, Body,Req,Get,ForbiddenException,Query, Delete } from '@nestjs/common';
import { LeavesService } from './leaves.services';
import { ApplyLeaveDto } from './schema/dto/applyleave.dto';
import { JwtAuthGuard } from 'src/admin/guards/admin.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateLeaveStatusDto } from './schema/dto/updateleave.dto';
import { LeavesStatus } from './leavesenum/leave.enum';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leavesService:LeavesService) {}

@UseGuards(JwtAuthGuard)
@Post('apply')
async applyLeave(@Req() req, @Body() applyLeaveDto:ApplyLeaveDto) {
  console.log(req.user);
  return this.leavesService.applyLeave(req.user.sub,applyLeaveDto)
}


@UseGuards(JwtAuthGuard)
@Get('admin/all')
async getAllLeaves(
  @Req() req,
  @Query('status') status?: LeavesStatus,
) {
    console.log(req.user);
  if (req.user.role !== 'admin') {
    throw new ForbiddenException('Only admin can view all leaves');
  }

  return this.leavesService.getAllLeaves(status);
}
   @Put('admin/:id/status')
   @UseGuards(JwtAuthGuard)
  updateLeaveStatus( @Req() req, @Param('id') leaveId: string,@Body() dto: UpdateLeaveStatusDto,) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can update leave status');
    }

    return this.leavesService.updateLeaveStatus(dto, leaveId);
  }

    @Get('admin/search')
    searchLeaves(@Query('search') search: string) {
    return this.leavesService.searchLeaves(search);
    }

     @UseGuards(JwtAuthGuard)
      @Get('leave-balance')
    async getLeaveBalance(@Req() req) {
      console.log(req.user)
      return this.leavesService.getLeaveBalance(req.user.sub);
    }
    @Get('my-leaves')
    @UseGuards(JwtAuthGuard)
    async getMyLeaveHistory(@Req() req) {
      console.log(req.user);
      return this.leavesService.getMyLeaveHistory(req.user.sub);
    }

    @Delete(':id')
    async deleteLeaves(@Param('id') id:string){
      return this.leavesService.deleteLeaves(id)
    }
}

