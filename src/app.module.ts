import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { MembersModule } from './members/members.module';
import { ContractsModule } from './contracts/contracts.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, WorkspacesModule, MembersModule, ContractsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
