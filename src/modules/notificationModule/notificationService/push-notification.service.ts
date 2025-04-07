import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidV4 } from 'uuid';
import { PushNotificationEntity } from '../notificationEntity.ts/notification.entity';
import { Repository } from 'typeorm';
import { NotificationGateway } from '../notifcation.gateway';
import {
  PushNotificationDto,
  UserPushNotificationDto,
} from '../utils/notification.dto';
import { UserPushNotificationEntity } from '../notificationEntity.ts/userNotification.entity';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger('notification service');
  constructor(
    @InjectRepository(PushNotificationEntity)
    private notificationRepository: Repository<PushNotificationEntity>,
    @InjectRepository(UserPushNotificationEntity)
    private userNotificationRepository: Repository<UserPushNotificationEntity>,

    private notificationGateway: NotificationGateway,
  ) {}

  async sendDriverNotification(pushNotificationDto: PushNotificationDto) {
    const { purchaseId, productId, id, message, metadata } =
      pushNotificationDto;

    const notification = this.notificationRepository.create({
      notificationId: uuidV4(),
      purchaseId,
      productId,
      id,
      message,
      metadata,
      isRead: false,
      createdAt: new Date(),
    });

    await this.notificationRepository.save(notification);

    this.notificationGateway.sendDriverNotification(id, message, metadata);
    this.logger.log('notification sent successfully');
    return notification;
  }

  getDriverNotification = async (
    driverId: string,
  ): Promise<PushNotificationEntity[]> => {
    const notification = this.notificationRepository.find({
      where: { id: driverId, isRead: false },
      order: { createdAt: 'DESC' },
    });
    this.logger.verbose('notification fetched successfully');
    return notification;
  };

  sendUserNotification = async (
    pushNotificationDto: UserPushNotificationDto,
  ) => {
    const { purchaseId, buyerId, productName, driverName, message, metadata } =
      pushNotificationDto;

    const notification = this.userNotificationRepository.create({
      notificationId: uuidV4(),
      purchaseId,
      buyerId,
      productName,
      driverName,
      message,
      metadata,
      isRead: false,
      createdAt: new Date(),
    });

    await this.userNotificationRepository.save(notification);

    this.notificationGateway.sendUserNotification(buyerId, message, metadata);
    this.logger.log('notification sent successfully');
    return notification;
  };

  getUserNotification = async (
    userId: string,
  ): Promise<UserPushNotificationEntity[]> => {
    const notification = await this.userNotificationRepository.find({
      where: {
        buyerId: userId,
        isRead: false,
      },
      order: { createdAt: 'DESC' },
    });
    this.logger.verbose('notification fetched successfully');
    return notification;
  };

  async markNotificationAsRead(notificationId: string) {
    await this.notificationRepository.update(notificationId, { isRead: true });
  }
}
