import { Controller, Post,Put,Param, Body,Req,Get,ForbiddenException,Query, Delete } from '@nestjs/common';
import { WFHService } from './wfh.services';
import { ApplyWFHDto } from './dto/applywfh.dto';
import { JwtAuthGuard } from '../admin/guards/admin.guard';
import { UseGuards } from '@nestjs/common';
import { UpdateWfhStatusDto } from './dto/updatewfh.dto';
import { WFHStatus } from './enum/wfh.enum';
@Controller('wfh')
export class WFHController {
  constructor(private readonly wfhService:WFHService) {}

@UseGuards(JwtAuthGuard)
@Post('apply')
async applyWFH(@Req() req, @Body() applyWFHDto:ApplyWFHDto) {
  console.log(req.user);
  return this.wfhService.applyWFH(req.user.sub,applyWFHDto)
}


@UseGuards(JwtAuthGuard)
@Get('admin/all')
async getAllWFH(
  @Req() req,
  @Query('status') status?: WFHStatus,
) {
    console.log(req.user);
  if (req.user.role !== 'admin') {
    throw new ForbiddenException('Only admin can view all leaves');
  }

  return this.wfhService.getAllWFH(status);
}
   @Put('admin/:id/status')
   @UseGuards(JwtAuthGuard)
  updateLeaveStatus( @Req() req, @Param('id') WFHId: string,@Body() dto: UpdateWfhStatusDto,) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can update leave status');
    }

    return this.wfhService.updateWfhStatus(dto, WFHId);
  }

   

    
    @Get('my-wfh')
    @UseGuards(JwtAuthGuard)
    async getMyLeaveHistory(@Req() req) {
      console.log(req.user);
      return this.wfhService.getMyWFHHistory(req.user.sub);
    }

  
}

