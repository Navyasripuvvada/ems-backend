import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WFHStatus } from '../enum/wfh.enum';

export class UpdateWfhStatusDto {
  @IsEnum([WFHStatus.APPROVED, WFHStatus.REJECTED])
  WFHStatus: WFHStatus;
}