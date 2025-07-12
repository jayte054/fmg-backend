import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class MessagingService {
  private client: Twilio;
  private from: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
    this.from = this.configService.get<string>('TWILIO_WHATSAPP_FROM');
  }

  async sendWithdrawalRequest(to: string, body: string): Promise<void> {
    await this.client.messages.create({
      body,
      from: this.from,
      to: `whatsapp:${to}`,
    });
  }

  async sendTokenMessage(to: string, body: string): Promise<void> {
    await this.client.messages.create({
      body,
      from: this.from,
      to,
    });
  }
}
