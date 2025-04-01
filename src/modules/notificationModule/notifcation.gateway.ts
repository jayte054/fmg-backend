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

  private driverSockets = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.warn(`client disconnected: ${client.id}`);
    for (const [driverId, socketId] of this.driverSockets.entries()) {
      if (socketId === client.id) {
        this.driverSockets.delete(driverId);
        break;
      }
    }
  }

  @SubscribeMessage('registerDriver')
  registerDriver(
    @MessageBody() driverId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.driverSockets.set(driverId, client.id);
    this.logger.log(`Driver ${driverId} regitered with socket ${client.id}`);
  }

  sendNotification(driverId: string, message: string, metadata?: any) {
    const socketId = this.driverSockets.get(driverId);
    if (socketId) {
      this.server.to(socketId).emit('notification', { message, metadata });
    }
  }
}
