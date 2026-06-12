import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LeavesStatus } from 'src/leaves/leavesenum/leave.enum';

export class UpdateLeaveStatusDto {
  @IsEnum([LeavesStatus.APPROVED, LeavesStatus.REJECT])
  Leavestatus: LeavesStatus;

  @IsOptional()
  @IsString()
  adminComment?: string;
}