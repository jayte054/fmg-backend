import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Twilio } from 'twilio';
import { UserNotificationEntity } from '../notificationEntity.ts/userNotification.entity';
import { Repository } from 'typeorm';
import { WithdrawalRequestEntity } from '../notificationEntity.ts/withdrawalRequest.entity';
import { WithdrawalStatus } from '../utils/interface';
import { AuditLogService } from '../../auditLogModule/auditLogService/auditLog.service';
import { LogCategory } from '../../auditLogModule/utils/logInterface';

@Injectable()
export class MessagingService {
  private client: Twilio;
  private from: string;
  private logger = new Logger(MessagingService.name);

  constructor(
    @InjectRepository(UserNotificationEntity)
    private notificationRepository: Repository<UserNotificationEntity>,
    @InjectRepository(WithdrawalRequestEntity)
    private readonly withdrawalRepository: Repository<WithdrawalRequestEntity>,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {
    this.client = new Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
    this.from = this.configService.get<string>('TWILIO_WHATSAPP_FROM');
  }

  async sendWithdrawalRequest(
    to: string,
    body: string,
    userId: string,
    amount: string,
    walletId: string,
  ): Promise<WithdrawalRequestEntity> {
    try {
      const response = await this.client.messages.create({
        from: `whatsapp:${this.from}`,
        body,
        to: `whatsapp:${to}`,
      });

      if (response.errorCode || response.status === 'failed') {
        this.logger.error('failed to send withdrawal request');
        throw new InternalServerErrorException(
          'failed to send whatsapp withdrawal request',
        );
      }

      const newRequest = this.withdrawalRepository.create({
        userId,
        amount,
        withdrawalStatus: WithdrawalStatus.pending,
        createdAt: new Date(),
        metadata: { walletId },
      });
      const request = await this.withdrawalRepository.save(newRequest);

      return request;
    } catch (error) {
      this.logger.error('failed to send withdrawal request message');
      throw new InternalServerErrorException('failed to send request');
    }
  }

  async updateWithdrawalRequest(
    requestId: string,
  ): Promise<{ message: string }> {
    const request = await this.withdrawalRepository.findOne({
      where: { requestId },
    });

    if (!request) {
      this.logger.error(`request with id ${requestId} does not exist`);
      throw new NotFoundException('request not found');
    }

    request.withdrawalStatus = WithdrawalStatus.successful;
    request.updatedAt = new Date();

    await this.withdrawalRepository.save(request);

    this.logger.log(`Withdrawal request ${requestId} marked as successful`);

    await this.auditLogService.log({
      logCategory: LogCategory.NOTIFICATION,
      description: 'Withdrawal marked as successful',
      email: request.userId,
      details: {
        requestId,
        status: WithdrawalStatus.successful,
      },
    });

    return { message: 'request successfully updated' };
  }

  async sendTokenMessage(
    to: string,
    body: string,
    notificationId: string,
  ): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { notificationId },
    });

    const textNotification = await this.client.messages.create({
      body,
      from: this.from,
      to,
    });

    if (textNotification) {
      notification.metadata['text_notification'] = 'true';

      await this.notificationRepository.save(notification);
      this.logger.log('text notification sent successfully');
    }
  }
}
