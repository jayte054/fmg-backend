import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FmgNotificationEntity } from './notificationEntity.ts/fmgNotification.entity';
import { PushNotificationService } from './notificationService/push-notification.service';
import { NotificationGateway } from './notifcation.gateway';
import { UserNotificationEntity } from './notificationEntity.ts/userNotification.entity';
import { MessagingService } from './notificationService/messaging.service';
import { WithdrawalRequestEntity } from './notificationEntity.ts/withdrawalRequest.entity';
import { AuditLogModule } from '../auditLogModule/auditLog.module';

@Module({
  imports: [
    AuditLogModule,
    TypeOrmModule.forFeature([
      FmgNotificationEntity,
      UserNotificationEntity,
      WithdrawalRequestEntity,
    ]),
  ],
  providers: [MessagingService, PushNotificationService, NotificationGateway],
  controllers: [],
  exports: [MessagingService, PushNotificationService, NotificationGateway],
})
export class NotificationModule {}
