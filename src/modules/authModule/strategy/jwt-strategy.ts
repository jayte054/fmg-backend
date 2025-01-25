import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as config from 'config';
import { AuthRepository } from '../repository/authRepository';
import { JwtPayload } from '../utils/auth.types';
import { AuthEntity } from '../authEntity/authEntity';

const jwtConfig: any = config.get('jwt');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(AuthRepository)
    private authRepository: AuthRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthEntity> {
    const { id, email, phoneNumber, role, isAdmin } = payload;

    const userQueryBuilder = this.authRepository.createQueryBuilder('user');
    userQueryBuilder
      .select([
        'user.email',
        'user.id',
        'user.phoneNumber',
        'user.role',
        'user.salt',
        'user.isAdmin',
      ])
      .where('user.email = :email', { email, id, phoneNumber, role, isAdmin });

    const user = await userQueryBuilder.getOne();

    if (!user) {
      throw new UnauthorizedException('unauthorized');
    } else {
      return user;
    }
  }
}
