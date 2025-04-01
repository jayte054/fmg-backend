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

  async sendNotification(pushNotificationDto: PushNotificationDto) {
    const { purchaseId, productId, driverId, message, metadata } =
      pushNotificationDto;

    const notification = this.notificationRepository.create({
      notificationId: uuidV4(),
      purchaseId,
      productId,
      driverId,
      message,
      metadata,
      isRead: false,
      createdAt: new Date(),
    });

    await this.notificationRepository.save(notification);

    this.notificationGateway.sendNotification(driverId, message, metadata);
    this.logger.log('notification sent successfully');
    return notification;
  }

  getDriverNotification = async (
    driverId: string,
  ): Promise<PushNotificationEntity[]> => {
    return this.notificationRepository.find({
      where: { driverId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  };

  async markNotificationAsRead(notificationId: string) {
    await this.notificationRepository.update(notificationId, { isRead: true });
  }
}
