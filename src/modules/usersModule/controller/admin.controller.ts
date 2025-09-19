import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AdminUserService } from '../service/admin.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { CreateAdminDto } from '../utils/user.dto';
import { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class AdminUserController {
  constructor(private readonly adminService: AdminUserService) {}

  @Post('/admin')
  @ApiOperation({ summary: 'create admin' })
  @ApiResponse({ status: 201, description: 'admin created' })
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(
    @Body(ValidationPipe) createAdminDto: CreateAdminDto,
    @Req() req: Request,
  ) {
    const { user }: any = req;

    return await this.adminService.createAdmin(createAdminDto, user);
  }
}
