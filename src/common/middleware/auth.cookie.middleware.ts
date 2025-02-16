import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response, Request, NextFunction } from 'express';

@Injectable()
export class JwtCookieMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies['jwt'];

    if (!token) {
      throw new UnauthorizedException('authentication token missing');
    }
    if (token) {
      try {
        const decoded = this.jwtService.verify(token);
        req.user = decoded;
      } catch (err) {
        throw new UnauthorizedException('invalid Jwt Token');
      }
    }
    next();
  }
}
