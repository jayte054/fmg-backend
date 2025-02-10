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
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { ProductService } from '../productService/product.service';
import { CreateProductCredentials } from '../utils/products.type';
import { GetDealerDecorator } from 'src/common/decorators/getDealerDecorator';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';
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
  async findProducs(@Query() page: number, @Query() limit: number) {
    return await this.productService.findProducts(page, limit);
  }
}
