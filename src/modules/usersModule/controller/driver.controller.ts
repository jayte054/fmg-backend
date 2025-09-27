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
import {
  CreateDriverCredentialsDto,
  DriverFilterDto,
  DriverResponseDto,
  PaginatedDriversResponseDto,
} from '../utils/user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('driver')
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Post('/createDriver')
  @ApiOperation({ summary: 'create driver' })
  @ApiResponse({
    status: 201,
    description: 'driver created successfully',
    type: DriverResponseDto,
  })
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
  @ApiOperation({ summary: 'find driver' })
  @ApiResponse({
    status: 302,
    description: 'driver found successfully',
    type: DriverResponseDto,
  })
  @HttpCode(HttpStatus.FOUND)
  async findDriverById(@Req() req: Request) {
    const { user }: any = req;
    return await this.driverService.findDriverById(user);
  }

  @Get('/findDriver/:driverId')
  @ApiOperation({ summary: 'find driver' })
  @ApiResponse({
    status: 302,
    description: 'driver found successfully',
    type: DriverResponseDto,
  })
  @HttpCode(HttpStatus.FOUND)
  async findDriverById2(
    @Req() req: Request,
    @Param('driverId') driverId: string,
  ) {
    const { user }: any = req;
    return await this.driverService.findDriverById2(user, driverId);
  }

  @Get('/findDrivers')
  @ApiOperation({ summary: 'find drivers' })
  @ApiResponse({
    status: 302,
    description: 'drivers fetched successfully',
    type: PaginatedDriversResponseDto,
  })
  @HttpCode(HttpStatus.FOUND)
  async findDrivers(@Query() filter: DriverFilterDto) {
    return await this.driverService.findDrivers(filter);
  }

  @Put('/updateDriver')
  @ApiOperation({ summary: 'find driver' })
  @ApiResponse({
    status: 200,
    description: 'driver found successfully',
    type: DriverResponseDto,
  })
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
  @ApiOperation({ summary: 'find driver' })
  @ApiResponse({
    status: 200,
    description: 'driver found successfully',
    type: DriverResponseDto,
  })
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
  @ApiOperation({ summary: 'find driver' })
  @ApiResponse({
    status: 200,
    description: 'driver found successfully',
  })
  @HttpCode(HttpStatus.OK)
  async deleteDriver(@Req() req: Request) {
    const { user }: any = req;
    return await this.driverService.deleteDriverProfile(user);
  }
}
