import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidV4 } from 'uuid';
import { FmgNotificationEntity } from '../notificationEntity.ts/fmgNotification.entity';
import { Repository } from 'typeorm';
import { NotificationGateway } from '../notifcation.gateway';
import {
  PushNotificationDto,
  UserPushNotificationDto,
} from '../utils/notification.dto';
import { UserNotificationEntity } from '../notificationEntity.ts/userNotification.entity';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger('notification service');
  constructor(
    @InjectRepository(FmgNotificationEntity)
    private notificationRepository: Repository<FmgNotificationEntity>,
    @InjectRepository(UserNotificationEntity)
    private userNotificationRepository: Repository<UserNotificationEntity>,

    private notificationGateway: NotificationGateway,
  ) {}

  async sendProductNotification(pushNotificationDto: PushNotificationDto) {
    const {
      purchaseId,
      productId,
      message,
      metadata,
      address,
      location,
      driverId,
      dealerId,
      buyerId,
    } = pushNotificationDto;

    const notification = this.notificationRepository.create({
      notificationId: uuidV4(),
      purchaseId,
      productId,
      message,
      address,
      location,
      metadata: { driverId, dealerId, buyerId },
      isRead: false,
      createdAt: new Date(),
    });
    try {
      await this.notificationRepository.save(notification);
      this.notificationGateway.sendDriverNotification(
        driverId,
        message,
        metadata,
      );
      this.notificationGateway.sendDealerNotification(
        dealerId,
        message,
        metadata,
      );
      this.logger.log('notification sent successfully');

      return notification;
    } catch (error) {
      console.log(error);
    }
  }

  getDriverNotification = async (
    driverId: string,
  ): Promise<FmgNotificationEntity[]> => {
    const notifications = await this.notificationRepository.find({
      where: { isRead: false },
      order: { createdAt: 'DESC' },
    });

    const driverNotification = notifications.filter(
      (notification) => notification?.metadata?.driverId === driverId,
    );

    this.logger.verbose('driver notification fetched successfully');
    return driverNotification;
  };

  getDealerNotification = async (
    dealerId: string,
  ): Promise<FmgNotificationEntity[]> => {
    const notifications = await this.notificationRepository.find({
      where: { isRead: false },
      order: { createdAt: 'DESC' },
    });

    const driverNotification = notifications.filter(
      (notification) => notification?.metadata?.dealerId === dealerId,
    );

    this.logger.verbose('driver notification fetched successfully');
    return driverNotification;
  };

  sendUserNotification = async (
    pushNotificationDto: UserPushNotificationDto,
  ) => {
    const {
      purchaseId,
      buyerId,
      productName,
      driverName,
      message,
      metadata,
      address,
      location,
    } = pushNotificationDto;

    const notification = this.userNotificationRepository.create({
      notificationId: uuidV4(),
      purchaseId,
      buyerId,
      productName,
      driverName,
      message,
      address,
      location,
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
  ): Promise<UserNotificationEntity[]> => {
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
