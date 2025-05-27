// import bcrypt from 'bcryptjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUser, CreateUserObject } from './types/create-user';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async createUser(user: CreateUser) {
    const validation = CreateUserObject.safeParse(user);

    if (!validation.success) {
      throw new BadRequestException('Some fields are missing on your request.');
    }

    const userWithEmail = await this.prismaService.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (userWithEmail) {
      throw new BadRequestException('This email is already registered.');
    }

    // const salt = bcrypt.genSaltSync(10);
    // const hash = bcrypt.hashSync(user.password, salt);

    const dbUser = await this.prismaService.user.create({
      data: {
        ...user,
        // password: hash,
      },
    });

    return dbUser;
  }

  async findUserByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });

    return user;
  }

  async deleteUser(id: string) {
    const deletedUser = await this.prismaService.user.delete({
      where: { id },
    });

    return deletedUser;
  }
}
