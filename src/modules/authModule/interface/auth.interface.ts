import { SignInDto, SignupDto } from '../utils/auth.dto';
import { SigninResponse, SignupResponse } from '../utils/auth.types';

export interface IAuthRepository {
  signup(signupDto: SignupDto): Promise<SignupResponse>;
  validatePassword(signinDto: SignInDto): Promise<SigninResponse>;
}
