import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidV4 } from 'uuid';
import { PushNotificationEntity } from '../notificationEntity.ts/notification.entity';
import { Repository } from 'typeorm';
import { NotificationGateway } from '../notifcation.gateway';
import { PushNotificationDto } from '../utils/notification.dto';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger('notification service');
  constructor(
    @InjectRepository(PushNotificationEntity)
    private notificationRepository: Repository<PushNotificationEntity>,
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

  sendUserNotification = async (pushNotificationDto: PushNotificationDto) => {
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

    this.notificationGateway.sendUserNotification(id, message, metadata);
    this.logger.log('notification sent successfully');
    return notification;
  };

  getUserNotification = async (
    userId: string,
  ): Promise<PushNotificationEntity[]> => {
    const notification = await this.notificationRepository.find({
      where: {
        id: userId,
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
