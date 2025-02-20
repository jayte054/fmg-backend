import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
// import * as config from 'config';
import {
  AuthCredentialsDto,
  SignInCredentials,
  SignupDto,
} from '../utils/auth.dto';
import { IAuthRepository } from '../interface/auth.interface';
import {
  JwtPayload,
  SigninResponse,
  SignupResponse,
} from '../utils/auth.types';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthModule');
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private jwtService: JwtService,
  ) {}

  signUp = async (
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<SignupResponse> => {
    const { email, password, phoneNumber, role } = authCredentialsDto;

    try {
      const existingUser = await this.authRepository.findUser(email);
      if (existingUser) {
        this.logger.log(`user with email ${email} already exists`);
        throw new ConflictException('user already exists');
      }
      const salt = await bcrypt.genSalt();
      const authId = uuidv4();
      const user: SignupDto = {
        id: authId,
        email,
        password: await bcrypt.hash(password, salt),
        phoneNumber,
        salt: salt,
        isAdmin: false,
        role,
      };

      const newUser = await this.authRepository.signup(user);
      this.logger.verbose('user created successfully');
      return {
        id: newUser.id,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        isAdmin: newUser.isAdmin,
      };
    } catch (error) {
      this.logger.error('error signing up');
      return error;
    }
  };

  signIn = async (
    signInCredentials: SignInCredentials,
    response: Response,
  ): Promise<SigninResponse> => {
    const userDetails =
      await this.authRepository.validatePassword(signInCredentials);
    try {
      const { id, email, isAdmin, phoneNumber, role } = userDetails;
      const payload: JwtPayload = {
        id,
        email,
        isAdmin,
        phoneNumber,
        role,
      };

      const accessToken = this.jwtService.sign(payload);
      this.logger.verbose(' JWT token successfuly generated');

      response.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const responsePayload = {
        id,
        email,
        phoneNumber,
        role,
        isAdmin,
      };
      return responsePayload;
    } catch (error) {
      this.logger.error('error signing in');
      throw new Error('incorrect user details');
    }
  };
}
