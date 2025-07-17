import { Module } from "@nestjs/common"
import { ContractsController } from "./contracts.controller";
import { ContractsService } from "./contracts.service";
import { PrismaModule } from "../prisma/prisma.module";
import { MembersModule } from "../members/members.module";

@Module({
  imports: [PrismaModule, MembersModule],
  controllers: [ContractsController],
  providers: [ContractsService]
})
export class ContractsModule {}