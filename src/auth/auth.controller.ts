import { Body, Controller, HttpCode, Param, Post } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { CreateUser } from "../users/types/create-user";

@Controller("auth")
export class AuthController {
  constructor(private usersService: UsersService) {}

  @Post("register")
  @HttpCode(201)
  createUser(@Body() user: CreateUser) {
    return this.usersService.createUser(user);
  }
}