import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
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
  @HttpCode(HttpStatus.CREATED)
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

  @Get('/findDriver')
  @HttpCode(HttpStatus.FOUND)
  async findDriverById(@Req() req: Request) {
    const { user }: any = req;
    return await this.driverService.findDriverById(user);
  }

  @Get('/findDrivers')
  @HttpCode(HttpStatus.FOUND)
  async findDrivers(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return await this.driverService.findDrivers(pageNum, limitNum);
  }
}
