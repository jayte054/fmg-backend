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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AccessoryService } from '../accessoryService/accessory.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AccessoryFilterDto,
  CreateAccessoryDto,
  UpdateAccessoryDto,
} from '../utils/dto';
import { GetBuyerDecorator } from 'src/common/decorators/getBuyerDecorator';
import { BuyerEntity } from 'src/modules/usersModule/userEntity/buyer.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
import { GetDealerDecorator } from 'src/common/decorators/getDealerDecorator';
import { AccessoryFilter } from '../utils/types';

@ApiTags('accessory')
@UseGuards(JwtAuthGuard)
@Controller('accessory')
export class AccessoryController {
  constructor(private readonly accessoryService: AccessoryService) {}

  @Post('createAccessory')
  @UseInterceptors(FilesInterceptor('files', 4))
  @ApiOperation({ summary: 'created new accessory' })
  @ApiResponse({ status: 201, description: 'accessory created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createAccessory(
    @GetDealerDecorator() dealer: DealerEntity,
    @UploadedFiles() files: Express.Multer.File[],
    @Body(ValidationPipe) createAccessoryDto: CreateAccessoryDto,
  ) {
    return await this.accessoryService.createAccessory(
      dealer,
      createAccessoryDto,
      files,
    );
  }

  @Get('findAccessoryId/:accessoryId')
  @ApiOperation({ summary: 'find accessory by accessory id' })
  @ApiResponse({ status: 200, description: 'accessory fetched successfully' })
  @HttpCode(HttpStatus.FOUND)
  async findAccessoryById(
    @Param('accessoryId') accessoryId: string,
    @GetBuyerDecorator() buyer?: BuyerEntity,
    @GetDealerDecorator() dealer?: DealerEntity,
  ) {
    return await this.accessoryService.findAccessoryById(
      accessoryId,
      buyer,
      dealer,
    );
  }

  @Get('findAccessories')
  @ApiOperation({ summary: 'find accessories' })
  @ApiResponse({ status: 200, description: 'accessories fetched succesfully' })
  @HttpCode(HttpStatus.OK)
  async findAccessories(
    @Body(ValidationPipe) accessoryFilter: AccessoryFilterDto,
    @GetBuyerDecorator() buyer: BuyerEntity,
  ) {
    return await this.accessoryService.findAccessories(accessoryFilter, buyer);
  }

  @Get('findAccessoriesByDealer')
  @ApiOperation({ summary: 'find accessories' })
  @ApiResponse({ status: 200, description: 'accessories fetched successfully' })
  @HttpCode(HttpStatus.OK)
  async findAccessoriesByDealer(
    @GetDealerDecorator() dealer: DealerEntity,
    @Body(ValidationPipe) accessoryFilter: AccessoryFilterDto,
  ) {
    return await this.accessoryService.findAccessoriesByDealer(
      dealer,
      accessoryFilter,
    );
  }

  @Put('updateAccessory/:accessoryId')
  @ApiOperation({ summary: 'update accessory' })
  @ApiResponse({ status: 200, description: 'accessory updated successfully' })
  @HttpCode(HttpStatus.OK)
  async updateAccessory(
    @GetDealerDecorator() dealer: DealerEntity,
    @Param('accessoryId') accessoryId: string,
    @Body(ValidationPipe) updateAccessoryInput: UpdateAccessoryDto,
  ) {
    return await this.accessoryService.updateAccessory(
      dealer,
      accessoryId,
      updateAccessoryInput,
    );
  }

  @Delete('deleteAccessory/:accessoryId')
  @ApiOperation({ summary: 'delete accessory' })
  @ApiResponse({ status: 200, description: 'accessory deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async deleteAccessory(
    @GetDealerDecorator() dealer: DealerEntity,
    @Param('accessoryId') accessoryId: string,
  ) {
    return await this.accessoryService.deleteAccessory(dealer, accessoryId);
  }

  @Put('toggleAccessoryStatus/:accessoryId')
  @ApiOperation({ summary: 'toggle accessory status' })
  @ApiResponse({
    status: 200,
    description: 'accessory status toggled successfully',
  })
  @HttpCode(HttpStatus.OK)
  async toggleAccessoryStatus(
    @GetDealerDecorator() dealer: DealerEntity,
    @Param('accessoryId') accessoryId: string,
  ) {
    return await this.accessoryService.toggleAccessoryStatus(
      dealer,
      accessoryId,
    );
  }
}
