import { Express } from 'express';
import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContractsService } from './contracts.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('contracts')
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @UseGuards(AuthGuard)
  @Post(':workspaceId')
  @UseInterceptors(FileInterceptor('file'))
  uploadContract(
    @UploadedFile() file: Express.Multer.File,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.contractsService.uploadContract({ file, workspaceId });
  }

  @UseGuards(AuthGuard)
  @Get(':workspaceId')
  getContracts(@Param('workspaceId') workspaceId: string, @Request() request) {
    return this.contractsService.getContracts({
      workspaceId,
      userId: request.user.id,
    });
  }
}
