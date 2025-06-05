import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUser } from './types/update-user';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Put('update-user')
  updateUser(@Body() user: UpdateUser, @Request() request) {
    return this.usersService.updateUser({ user, userId: request.user.id });
  }

  @UseGuards(AuthGuard)
  @Get('get-user')
  getUser(@Request() request) {
    return this.usersService.getUser(request.user.id);
  }

  @UseGuards(AuthGuard)
  @Delete('delete-user')
  deleteUser(@Request() request) {
    return this.usersService.deleteUser(request.user.id);
  }
}
