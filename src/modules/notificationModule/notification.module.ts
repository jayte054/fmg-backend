import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushNotificationEntity } from './notificationEntity.ts/notification.entity';
import { PushNotificationService } from './notificationService/push-notification.service';
import { NotificationGateway } from './notifcation.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([PushNotificationEntity])],
  providers: [PushNotificationService, NotificationGateway],
  controllers: [],
  exports: [PushNotificationService, NotificationGateway],
})
export class NotificationModule {}
