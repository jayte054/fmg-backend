import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessoryService } from '../accessoryService/accessory.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Accessory')
@UseGuards(JwtAuthGuard)
@Controller('accessory')
export class AccessoryController {
  constructor(private readonly accessoryService: AccessoryService) {}

  @Post('createAccessory')
  @ApiOperation({ summary: 'created new accessory' })
  @ApiResponse({ status: 201, description: 'accessory created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createAccessory() {}
}
