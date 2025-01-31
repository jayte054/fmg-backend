import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { DriverService } from '../service/driver.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { CreateDriverCredentials } from '../utils/user.types';

@UseGuards(JwtAuthGuard)
@Controller('driver')
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Post('/createDriver')
  @UseInterceptors(FilesInterceptor('files', 2))
  async createDriver(
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
    @Body(ValidationPipe) driverCredentials: CreateDriverCredentials,
  ) {
    const { user }: any = req;
    return await this.driverService.createDriver(
      user,
      driverCredentials,
      files,
    );
  }
}
