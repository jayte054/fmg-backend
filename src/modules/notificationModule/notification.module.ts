import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushNotificationEntity } from './notificationEntity.ts/notification.entity';
import { PushNotificationService } from './notificationService/push-notification.service';
import { NotificationGateway } from './notifcation.gateway';
import { UserPushNotificationEntity } from './notificationEntity.ts/userNotification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PushNotificationEntity,
      UserPushNotificationEntity,
    ]),
  ],
  providers: [PushNotificationService, NotificationGateway],
  controllers: [],
  exports: [PushNotificationService, NotificationGateway],
})
export class NotificationModule {}
