import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationGateway {
  private readonly logger = new Logger('notificationGateway');
  @WebSocketServer()
  server: Server;

  private clientSockets = new Map<string, string>();

  handleConnection(client: Socket) {
    const id = (client.handshake.query.userId ||
      client.handshake.query.driverId) as string;

    if (!id) {
      this.logger.warn(
        '❌ Connection rejected: userId or driverId not provided',
      );
      client.disconnect();
      return;
    }

    this.clientSockets.set(id, client.id);
    this.logger.log(`✅ Connected: ${id} (socketId: ${client.id})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.warn(`client disconnected: ${client.id}`);
    for (const [clientId, socketId] of this.clientSockets.entries()) {
      if (socketId === client.id) {
        this.clientSockets.delete(clientId);
        this.logger.log(`Removed socket mapping for ${clientId}`);
        break;
      }
    }
  }

  @SubscribeMessage('registerDriver')
  registerDriver(
    @MessageBody() driverId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.clientSockets.set(driverId, client.id);
    this.logger.log(`User ${driverId} registered with socket ${client.id}`);
  }

  sendDriverNotification(driverId: string, message: string, metadata?: any) {
    console.log(driverId);
    const socketId = this.clientSockets.get(driverId);
    if (socketId) {
      this.server.to(socketId).emit('notification', { message, metadata });
      this.logger.log(`socket found for driver ${driverId}`);
    } else {
      this.logger.warn(`Socket for driver ${driverId} not found`);
    }
  }

  @SubscribeMessage('registerUser')
  registerUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.clientSockets.set(userId, client.id);
    this.logger.log(`Driver ${userId} registered with socket ${client.id}`);
  }

  sendUserNotification(userId: string, message: string, metadata?: any) {
    const socketId = this.clientSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', { message, metadata });
      this.logger.log(`Socket for user ${userId} found`);
    } else {
      this.logger.warn(`Socket for user ${userId} not found`);
    }
  }
}
