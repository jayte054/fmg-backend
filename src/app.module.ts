import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './typeormconfig/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/authModule/authModule';
import { JwtCookieMiddleware } from './common/middleware/auth.cookie.middleware';
import { UserModule } from './modules/usersModule/user.module';
import { UserController } from './modules/usersModule/controller/buyer.controller';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtCookieMiddleware).forRoutes(UserController);
  }
}
