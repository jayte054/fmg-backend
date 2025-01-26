import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../service/auth.service';
import { AuthCredentialsDto, SignInCredentials } from '../utils/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signup(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto) {
    return await this.authService.signUp(authCredentialsDto);
  }

  @Post('/signin')
  async signin(
    @Body(ValidationPipe) signInCredentials: SignInCredentials,
    @Res() response: Response,
  ) {
    const user = await this.authService.signIn(signInCredentials, response);
    response.status(200).json({
      message: 'Sign-in successful',
      user,
    });
  }
}
