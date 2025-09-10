import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt.authGuard';
import { DriverService } from '../service/driver.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { UpdateDriverCredentials } from '../utils/user.types';
import { CreateDriverCredentialsDto } from '../utils/user.dto';

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
    @Body(ValidationPipe) driverCredentials: CreateDriverCredentialsDto,
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

  @Get('/findDriver/:driverId')
  @HttpCode(HttpStatus.FOUND)
  async findDriverById2(
    @Req() req: Request,
    @Param('driverId') driverId: string,
  ) {
    const { user }: any = req;
    return await this.driverService.findDriverById2(user, driverId);
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

  @Put('/updateDriver')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async updateDriver(
    @Req() req: Request,
    @Body(ValidationPipe) updateDriverCredentials: UpdateDriverCredentials,
    @UploadedFiles() file: Express.Multer.File,
  ) {
    const { user }: any = req;
    return await this.driverService.updateDriver(
      user,
      updateDriverCredentials,
      file,
    );
  }

  @Put('/updateDriverImage')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async updateDriverImage(
    @Req() req: Request,
    // @Body(ValidationPipe) updateDriverCredentials: UpdateDriverCredentials,
    @UploadedFiles() file: Express.Multer.File,
  ) {
    const { user }: any = req;
    return await this.driverService.updateDriverImage(
      user,
      //   updateDriverCredentials,
      file,
    );
  }

  @Delete('deleteDriverProfile')
  @HttpCode(HttpStatus.OK)
  async deleteDriver(@Req() req: Request) {
    const { user }: any = req;
    return await this.driverService.deleteDriverProfile(user);
  }
}
