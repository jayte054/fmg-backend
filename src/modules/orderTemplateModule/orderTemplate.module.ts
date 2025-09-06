import { Module } from '@nestjs/common';
import { OrderTemplateEntity } from './orderTemplateEntity/orderTemplate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTemplateService } from './orderTemplateService/orderTemplate.service';
import { OrderTemplateRepository } from './templateRepository/orderTemplate.repository';
import { UserModule } from '../usersModule/user.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([OrderTemplateEntity])],
  providers: [
    OrderTemplateService,
    {
      provide: 'IOrderInterfaceRepository',
      useClass: OrderTemplateRepository,
    },
  ],
  controllers: [],
  exports: [],
})
export class OrderTemplateModule {}
