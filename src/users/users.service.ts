// import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUser, CreateUserObject } from './types/create-user';
import { SignInUser, SignInUserObject } from './types/sign-in-user';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signInUser(user: SignInUser) {
    const validation = SignInUserObject.safeParse(user);

    if (!validation.success) {
      throw new BadRequestException({
        errors: validation.error.issues,
        statusCode: 400,
      });
    }

    const isUserRegistered = await this.findUserByEmail(user.email);

    if (!isUserRegistered) {
      throw new UnauthorizedException(
        'The email or the password are incorrect.',
      );
    }

    const isUserAuthorized = await this.authorizeUser({
      email: user.email,
      password: user.password,
    });

    if (!isUserAuthorized) {
      throw new UnauthorizedException(
        'The email or the password are incorrect.',
      );
    }

    const token = await this.authenticateUser(isUserAuthorized);

    return {
      success: true,
      token,
      statusCode: 200,
    };
  }

  async authenticateUser(user: User) {
    const payload = { sub: user.id, email: user.email };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });

    return token;
  }

  async authorizeUser(user: SignInUser) {
    const dbUser = await this.prismaService.user.findUnique({
      where: {
        email: user.email,
        password: user.password,
      },
    });

    return dbUser;
  }

  async createUser(user: CreateUser) {
    const validation = CreateUserObject.safeParse(user);

    if (!validation.success) {
      throw new BadRequestException({
        errors: validation.error.issues,
        statusCode: 400,
      });
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
        email,
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
