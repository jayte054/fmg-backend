import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt.authGuard';
import { ProductService } from '../productService/product.service';
import { CreateProductCredentials } from '../utils/products.type';
import { GetDealerDecorator } from 'src/common/decorators/getDealerDecorator';
import { DealerEntity } from 'src/modules/usersModule/userEntity/dealerEntity';

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
}
