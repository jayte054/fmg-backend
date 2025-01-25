import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './typeormconfig/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/authModule/authModule';
import { JwtCookieMiddleware } from './common/middleware/auth.cookie.middleware';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtCookieMiddleware).forRoutes();
  }
}
