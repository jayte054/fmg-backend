import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../service/auth.service';
import { AuthCredentialsDto, SignInCredentials } from '../utils/auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: 'sign up' })
  @ApiResponse({ status: 200, description: 'user sign up' })
  async signup(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto) {
    return await this.authService.signUp(authCredentialsDto);
  }

  @Post('/signin')
  @ApiOperation({ summary: 'signin' })
  @ApiResponse({ status: 200, description: 'user signed in' })
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

  @Post('/adminSignup')
  @ApiOperation({ summary: 'admin sign up' })
  @ApiResponse({ status: 200, description: 'admin sign up' })
  async adminSignup(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ) {
    return await this.authService.adminSignUp(authCredentialsDto);
  }
}
