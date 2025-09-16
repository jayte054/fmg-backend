import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ValidationPipe,
  Body,
  Req,
  Get,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt.authGuard';
import { ProductService } from '../productService/product.service';
import {
  AddDriverCredential,
  UpdateProductCredentials,
} from '../utils/products.type';
import { GetDealerDecorator } from '../../../common/decorators/getDealerDecorator';
import { DealerEntity } from '../../usersModule/userEntity/dealerEntity';
import { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateProductCredentialsDto,
  FindProductsFilterDto,
} from '../utils/products.dto';

@ApiTags('Product')
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('/createProduct')
  @ApiOperation({ summary: 'created new product' })
  @ApiResponse({ status: 201, description: 'user created a new product' })
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @Body(ValidationPipe) createProductCredentials: CreateProductCredentialsDto,
    @GetDealerDecorator() dealer: DealerEntity,
  ) {
    return await this.productService.createProduct(
      dealer,
      createProductCredentials,
    );
  }

  @Get('findProductById/:productId')
  @ApiOperation({ summary: 'find product' })
  @ApiResponse({ status: 200, description: 'user fetched a single product' })
  @HttpCode(HttpStatus.OK)
  async findProductById(
    @Req() req: Request,
    @GetDealerDecorator() dealer: DealerEntity,
    @Param('productId') productId: string,
  ) {
    const { user }: any = req;
    return await this.productService.findProductById(user, dealer, productId);
  }

  @Get('/findProducts')
  @ApiOperation({ summary: 'find products' })
  @ApiResponse({ status: 200, description: 'user fetched products' })
  @HttpCode(HttpStatus.OK)
  async findProducts(@Query() filterDto: FindProductsFilterDto) {
    return await this.productService.findProducts(filterDto);
  }

  @Put('/updateProduct/:productId')
  @ApiOperation({ summary: 'update product' })
  @ApiResponse({ status: 200, description: 'user updated product' })
  @HttpCode(HttpStatus.OK)
  async updateProduct(
    @Req() req: Request,
    @GetDealerDecorator() dealer: DealerEntity,
    @Param('productId') productId: string,
    @Body(ValidationPipe) updateProductCredentials: UpdateProductCredentials,
  ) {
    const { user }: any = req;
    const { dealerId }: DealerEntity = dealer;

    return await this.productService.updateProduct(
      user,
      dealerId,
      productId,
      updateProductCredentials,
    );
  }

  @Delete('deleteProduct/:productId')
  @ApiOperation({ summary: 'delete product' })
  @ApiResponse({ status: 200, description: 'user deleted product' })
  @HttpCode(HttpStatus.OK)
  async deleteProduct(
    @GetDealerDecorator() dealer: DealerEntity,
    @Param('productId') productId: string,
  ) {
    const { dealerId }: DealerEntity = dealer;
    return await this.productService.deleteProduct(dealerId, productId);
  }

  @Put('addDriver/:productId')
  @ApiOperation({ summary: 'add driver' })
  @ApiResponse({ status: 200, description: 'user added a driver' })
  @HttpCode(HttpStatus.OK)
  async addDriver(
    @GetDealerDecorator() { dealerId }: DealerEntity,
    @Param('productId') productId: string,
    @Body(ValidationPipe) addDriverCredentials: AddDriverCredential,
  ) {
    return await this.productService.addDriver(
      dealerId,
      productId,
      addDriverCredentials,
    );
  }

  @Put('removeDriver/:productId/:driverId')
  @ApiOperation({ summary: 'remove driver' })
  @ApiResponse({ status: 200, description: 'user removed driver' })
  @HttpCode(HttpStatus.OK)
  async removeDriver(
    @GetDealerDecorator() { dealerId }: DealerEntity,
    @Param('driverId') driverId: string,
    @Param('productId') productId: string,
  ) {
    return await this.productService.removeDriver(
      dealerId,
      productId,
      driverId,
    );
  }
}
