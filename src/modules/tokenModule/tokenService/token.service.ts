import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ITokenRepository } from '../interface/iTokenRepository';
import { TokenEntity } from '../tokenEntity/token.entity';
import {
  FindTokenFilter,
  ResendTokenInterface,
  TokenResponse,
  TokenType,
} from '../utils/token.interface';
import { FindOptionsWhere } from 'typeorm';
import { AuditLogService } from 'src/modules/auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from 'src/modules/auditLogModule/utils/logInterface';
import { MailerService } from 'src/modules/notificationModule/notificationService/mailerService';

@Injectable()
export class TokenService {
  private logger = new Logger(TokenService.name);
  constructor(
    @Inject('ITokenRepository')
    private readonly tokenRepository: ITokenRepository,
    private readonly auditLogService: AuditLogService,
    private readonly mailerService: MailerService,
  ) {}

  createToken = async (
    tokenType: TokenType,
    userId: string,
  ): Promise<TokenResponse> => {
    const generateToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const TOKEN_EXPIRATION = {
      [TokenType.change_password_token]: 10,
      [TokenType.delivery_token]: 60,
    };

    const expiresInMinutes = TOKEN_EXPIRATION[tokenType] ?? 60;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const newToken = await this.tokenRepository.createToken({
      token: generateToken.toString(),
      tokenType,
      createdAt: new Date(),
      verificationStatus: false,
      expiresAt,
      userId,
    });

    if (!newToken) {
      this.logger.error('failed to create new token');
      throw new InternalServerErrorException('failed to create token');
    }

    await this.auditLogService.log({
      logCategory: LogCategory.TOKEN,
      description: 'token generated',
      details: {
        token: newToken.token,
        tokenType,
        userId,
      },
    });

    return {
      tokenId: newToken.tokenId,
      token: newToken.token,
      expiresAt: newToken.expiresAt.toISOString(),
    };
  };

  findToken = async (
    findTokenFilter: FindTokenFilter,
  ): Promise<TokenEntity> => {
    const { tokenId, userId, purchaseId } = findTokenFilter;

    const filter = {
      ...(tokenId !== undefined && { tokenId }),
      ...(userId !== undefined && { userId }),
      ...(purchaseId !== undefined && { purchaseId }),
    };

    const token = await this.tokenRepository.findToken(filter);

    if (!token) {
      this.logger.warn(`token with id ${tokenId} not found`);
      throw new NotFoundException('token not found');
    }

    return token;
  };

  updateToken = async (tokenId: string, purchaseId: string) => {
    const filter: FindOptionsWhere<TokenEntity> = { tokenId };
    const data = { purchaseId };
    try {
      return await this.tokenRepository.updateToken(filter, data);
    } catch (error) {
      this.logger.warn('failed to update token with id', tokenId);
      throw new InternalServerErrorException('failed to update token');
    }
  };

  verifyToken = async (
    tokenId: string,
    token: string,
    purchaseId: string,
  ): Promise<{ message: string }> => {
    const purchaseToken = await this.findToken({ tokenId, purchaseId });

    if (!purchaseToken) {
      this.logger.error('Token not found');
      throw new NotFoundException('Token not found');
    }

    // Check if token matches and is not expired
    if (token !== purchaseToken.token) {
      this.logger.error('Invalid token');
      throw new BadRequestException('Invalid token');
    }

    if (new Date() > new Date(purchaseToken.expiresAt)) {
      this.logger.error('Token expired');
      throw new BadRequestException('Token has expired');
    }

    await this.tokenRepository.verifyToken(tokenId);
    this.logger.log('Token successfully verified');

    await this.auditLogService.log({
      logCategory: LogCategory.TOKEN,
      description: 'token verified',
      details: {
        token,
        tokenId,
        purchaseId,
      },
    });

    return { message: 'Token successfully verified' };
  };

  resendToken = async (
    resendTokenInterface: ResendTokenInterface,
  ): Promise<{ message: string }> => {
    const { email, purchaseId, purchaseTitle } = resendTokenInterface;
    const token = await this.tokenRepository.findToken({ purchaseId });

    if (!token) {
      this.logger.warn(`token with id ${purchaseId} not found`);
      throw new NotFoundException('token not found');
    }

    const newToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const data: Partial<TokenEntity> = {
      token: newToken,
      expiresAt,
    };

    const updateToken = await this.tokenRepository.updateToken(
      { purchaseId },
      data,
    );

    if (!updateToken?.affected) {
      this.logger.error('failed to update token');
      throw new InternalServerErrorException('failed to update token');
    }

    const tokenNotificationInterface = {
      token: data.token,
      email,
      expiration: expiresAt.toISOString(),
      purchaseTitle,
    };

    await this.mailerService.sendDeliveryMail(tokenNotificationInterface);

    await this.auditLogService.log({
      logCategory: LogCategory.TOKEN,
      description: 'token resent',
      details: {
        token: newToken,
        purchaseId,
      },
    });

    this.logger.verbose(`token resent successfully for email ${email}`);
    return { message: 'token resent successfully' };
  };
}
