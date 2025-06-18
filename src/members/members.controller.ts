import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @UseGuards(AuthGuard)
  @Get(':workspaceId')
  @HttpCode(200)
  getMembers(@Param('workspaceId') workspaceId: string) {
    return this.membersService.getMembers({ workspaceId });
  }

  @UseGuards(AuthGuard)
  @Delete(':memberId')
  @HttpCode(200)
  deleteMember(
    @Param('memberId') memberId: string,
    @Query('workspaceId') workspaceId: string,
    @Request() request,
  ) {
    return this.membersService.deleteMember({
      workspaceId,
      memberId,
      userId: request.user.id,
    });
  }

  @UseGuards(AuthGuard)
  @Put(':memberId')
  @HttpCode(200)
  updateMemberRole(
    @Param('memberId') memberId: string,
    @Query('workspaceId') workspaceId: string,
    @Request() request,
  ) {
    return this.membersService.updateMemberRole({
      workspaceId,
      memberId,
      userId: request.user.id,
    });
  }
}
