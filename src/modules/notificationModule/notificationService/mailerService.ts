import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
  Gmail_Password,
  Gmail_User,
} from 'src/modules/cloudinaryModule/cloudinaryConfig';
import { TokenNotificationInterface } from '../utils/notification.dto';

@Injectable()
export class MailerService {
  private logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: Gmail_User,
        password: Gmail_Password,
      },
    });
  }

  async sendWelcomeMail(email: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: Gmail_User,
      to: email,
      subject: 'Welcome to FMG – Your Trusted Gas Filling Service!',
      html: `
        <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <!-- Header Section -->
            <div style="text-align: center; background-color: #ff6600; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0;">FMG</h1>
                <p style="color: #ffffff; font-size: 18px; margin-top: 5px;">Fast & Reliable Gas Delivery</p>
            </div>

            <!-- Email Content -->
            <div style="padding: 20px; text-align: center;">
                <h2 style="color: #333;">Welcome to FMG!</h2>
                <p style="font-size: 16px; color: #555;">Dear <b>${email}</b>,</p>
                <p style="font-size: 16px; color: #555;">
                    We're excited to have you on board! FMG is committed to providing you with a seamless and convenient way to refill your gas cylinders from the comfort of your home.
                </p>
                <p style="font-size: 16px; color: #555;">
                    With our reliable service, you can order gas refills in just a few clicks and get **fast delivery** to your doorstep.
                </p>
                <p style="font-size: 16px; color: #555;">
                    To get started, simply log in, place an order, and let us handle the rest!
                </p>

                <!-- Call to Action Button -->
                <a href="https://yourgasplatform.com" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #ff6600; color: #ffffff; text-decoration: none; font-size: 16px; border-radius: 5px;">Order Your Gas Now</a>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding: 15px; font-size: 14px; color: #777; border-top: 1px solid #ddd;">
                &copy; ${new Date().getFullYear()} FMG. All rights reserved. <br>
                Need help? <a href="mailto:support@yourgasplatform.com" style="color: #ff6600; text-decoration: none;">Contact Support</a>
            </div>
        </div>
        `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.verbose(`User ${email} welcome mail sent successfully`);
    } catch (error) {
      console.log(error);
      this.logger.error(`User ${email} invalid email address`);
      throw new InternalServerErrorException(
        `user with email ${email} not found`,
      );
    }
  }

  async sendDeliveryMail(
    tokenNotificationInterface: TokenNotificationInterface,
  ): Promise<void> {
    const { token, email, expiration, purchaseTitle } =
      tokenNotificationInterface;

    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email config error:', error);
      } else {
        console.log('Email transporter is ready to send messages');
      }
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: Gmail_User,
      to: email,
      subject: 'Your FMG Delivery Token & Order Details',
      html: `
          <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
              <!-- Header Section -->
              <div style="text-align: center; background-color: #ff6600; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h1 style="color: #ffffff; margin: 0;">FMG</h1>
                  <p style="color: #ffffff; font-size: 18px; margin-top: 5px;">Fast & Reliable Gas Delivery</p>
              </div>
      
              <!-- Email Content -->
              <div style="padding: 20px; text-align: center;">
                  <h2 style="color: #333;">Your Delivery Token</h2>
                  <p style="font-size: 16px; color: #555;">Hello <b>${email}</b>,</p>
                  <p style="font-size: 16px; color: #555;">
                      Your token for the delivery of <b>${purchaseTitle}</b> is:
                  </p>
                  <p style="font-size: 24px; color: #ff6600; font-weight: bold; margin: 20px 0;">
                      ${token}
                  </p>
                  <p style="font-size: 16px; color: #555;">
                      This token is valid until <b>${new Date(expiration).toLocaleString()}</b>. Please provide this token to the delivery personnel to verify your order.
                  </p>
      
                  <!-- Call to Action Button -->
                  <a href="https://yourgasplatform.com/orders" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #ff6600; color: #ffffff; text-decoration: none; font-size: 16px; border-radius: 5px;">View Order</a>
              </div>
      
              <!-- Footer -->
              <div style="text-align: center; padding: 15px; font-size: 14px; color: #777; border-top: 1px solid #ddd;">
                  &copy; ${new Date().getFullYear()} FMG. All rights reserved. <br>
                  Need help? <a href="mailto:support@yourgasplatform.com" style="color: #ff6600; text-decoration: none;">Contact Support</a>
              </div>
          </div>
        `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.verbose(
        `User ${email} delivery token mail sent successfully`,
      );
    } catch (error) {
      this.logger.error(`User ${email} invalid email address`);
      throw new InternalServerErrorException(
        `user with email ${email} not found`,
      );
    }
  }
}
