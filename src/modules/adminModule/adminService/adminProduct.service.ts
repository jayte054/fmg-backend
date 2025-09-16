import { Injectable, Logger } from '@nestjs/common';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from 'src/modules/auditLogModule/utils/logInterface';
import { ProductService } from 'src/modules/ProductModule/productService/product.service';
import { FindProductsFilterDto } from 'src/modules/ProductModule/utils/products.dto';
import { AdminEntity } from 'src/modules/usersModule/userEntity/admin.entity';

@Injectable()
export class AdminProductService {
  private readonly logger = new Logger(AdminProductService.name);
  constructor(
    private readonly productService: ProductService,
    private readonly auditLogService: AuditLogService,
  ) {}

  findProducts = async (
    admin: AdminEntity,
    filterDto: FindProductsFilterDto,
  ) => {
    const products = await this.productService.findProducts(filterDto);

    this.auditLogService.log({
      logCategory: LogCategory.PRODUCT,
      email: admin.email,
      description: 'admin fetched list of products',
      details: {
        filterDto: JSON.stringify(filterDto),
        adminId: admin.adminId,
      },
    });
    this.logger.log('products fetched successfully by admin');
    return products;
  };

  findProduct = async (admin: AdminEntity, productId: string) => {
    const product =
      await this.productService.findProductByPaymentService(productId);

    this.auditLogService.log({
      logCategory: LogCategory.PRODUCT,
      email: admin.email,
      description: 'product fetched by admin successfully',
      details: {
        productId,
        adminId: admin.adminId,
      },
    });

    this.logger.log('product fetched successfully');

    return product;
  };
}
