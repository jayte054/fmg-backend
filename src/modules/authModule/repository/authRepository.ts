import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuthEntity } from '../authEntity/authEntity';
import { SignInDto, SignupDto } from '../utils/auth.dto';

@Injectable()
export class AuthRepository extends Repository<AuthEntity> {
  private logger = new Logger('AuthModule');
  constructor(private dataSource: DataSource) {
    super(AuthEntity, dataSource.createEntityManager());
  }

  signup = async (user: SignupDto) => {
    const newSignup = new AuthEntity();
    newSignup.id = user.id;
    newSignup.email = user.email;
    newSignup.password = user.password;
    newSignup.salt = user.salt;
    newSignup.phoneNumber = user.phoneNumber;
    newSignup.role = user.role;
    newSignup.isAdmin = user.isAdmin;

    try {
      const newUser = await newSignup.save();
      return newUser;
    } catch (error) {
      if (error.code === '23505') {
        this.logger.error('user already exists');
        throw new ConflictException('user already exists');
      } else {
        this.logger.error('error with signup');
        throw new InternalServerErrorException('signup failed');
      }
    }
  };

  validatePassword = async (
    signinDto: SignInDto,
  ): Promise<{
    id: string;
    email: string;
    isAdmin: boolean;
    phoneNumber: string;
    role: string;
  }> => {
    const { email, password } = signinDto;
    const queryBuilder = this.createQueryBuilder('user');
    queryBuilder
      .select([
        'user.email',
        'user.id',
        'user.phoneNumber',
        'user.role',
        'user.salt',
        'user.password',
        'user.isAdmin',
      ])
      .where('user.email = :email', { email });

    const user = await queryBuilder.getOne();
    console.log(user);
    const userValidation = await user.validatePassword(password);
    if (user && userValidation) {
      return {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        phoneNumber: user.phoneNumber,
        role: user.role,
      };
    } else {
      return null;
    }
  };

  findUser = async (email: string) => {
    return await this.createQueryBuilder('auth')
      .where('auth.email = :email', { email })
      .getOne();
    // return await this.findOne({ where: { email } });
  };
}
