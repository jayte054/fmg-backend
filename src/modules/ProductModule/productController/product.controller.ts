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
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { ProductService } from '../productService/product.service';
import {
  AddDriverCredential,
  CreateProductCredentials,
  UpdateProductCredentials,
} from '../utils/products.type';
import { GetDealerDecorator } from 'src/common/decorators/getDealerDecorator';
import { DealerEntity } from '../../usersModule/userEntity/dealerEntity';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('/createProduct')
  @HttpCode(HttpStatus.CREATED)
  async createProduct(
    @Body(ValidationPipe) createProductCredentials: CreateProductCredentials,
    @GetDealerDecorator() dealer: DealerEntity,
  ) {
    console.log(dealer.dealerId);
    return await this.productService.createProduct(
      dealer,
      createProductCredentials,
    );
  }

  @Get('findProductById/:productId')
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
  @HttpCode(HttpStatus.OK)
  async findProducts(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.productService.findProducts(page, limit);
  }

  @Put('/updateProduct/:productId')
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
  @HttpCode(HttpStatus.OK)
  async deleteProduct(
    @GetDealerDecorator() dealer: DealerEntity,
    @Param('productId') productId: string,
  ) {
    const { dealerId }: DealerEntity = dealer;
    return await this.productService.deleteProduct(dealerId, productId);
  }

  @Put('addDriver/:productId')
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
