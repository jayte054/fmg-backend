import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './authEntity/authEntity';
import { AuthService } from './service/auth.service';
import { AuthRepository } from './repository/authRepository';
import { AuthController } from './controller/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as config from 'config';
import { NotificationModule } from '../notificationModule/notification.module';
import { MailerService } from '../notificationModule/notificationService/mailerService';
// import { UserModule } from '../usersModule/user.module';

const jwtConfig: any = config.get('jwt');

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn,
      },
    }),
    NotificationModule,
  ],
  controllers: [AuthController],
  providers: [
    MailerService,
    AuthService,
    {
      provide: 'IAuthRepository',
      useClass: AuthRepository,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
