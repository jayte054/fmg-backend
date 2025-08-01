import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from './tokenEntity/token.entity';
import { TokenService } from './tokenService/token.service';
import { TokenRepository } from './tokenRepository/token.repository';
import { AuditLogModule } from '../auditLogModule/auditLog.module';
import { NotificationModule } from '../notificationModule/notification.module';
import { MailerService } from '../notificationModule/notificationService/mailerService';
import { BuyerRepositoryMiddleware } from '../../common/middleware/buyer.repository.middleware';
import { TokenController } from './controller/token.controller';
import { UserModule } from '../usersModule/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TokenEntity]),
    AuditLogModule,
    NotificationModule,
    UserModule,
  ],
  controllers: [TokenController],
  providers: [
    MailerService,
    TokenService,
    {
      provide: 'ITokenRepository',
      useClass: TokenRepository,
    },
  ],
  exports: [TokenService],
})
export class TokenModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BuyerRepositoryMiddleware).forRoutes(TokenController);
  }
}
