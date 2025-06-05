import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('user-info')
  getUser(@Request() request) {
    return this.usersService.getUser(request.user.id);
  }

  @UseGuards(AuthGuard)
  @Delete('delete-user')
  deleteUser(@Request() request) {
    return this.usersService.deleteUser(request.user.id);
  }
}
