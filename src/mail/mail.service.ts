import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const from = this.configService.get<string>(
      'SMTP_FROM',
      'no-reply@cinereserve.com',
    );
    const mailOptions = {
      from,
      to: email,
      subject: 'CineReserve - Verify your email',
      text: `Your verification code is: ${code}. It expires in 15 minutes.`,
      html: `<p>Your verification code is: <strong>${code}</strong>. It expires in 15 minutes.</p>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      // Fallback log for development
      this.logger.warn(`FALLBACK: Code for ${email} is: ${code}`);
    }
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    const from = this.configService.get<string>(
      'SMTP_FROM',
      'no-reply@cinereserve.com',
    );
    const mailOptions = {
      from,
      to: email,
      subject: 'CineReserve - Password Reset Request',
      text: `Your password reset code is: ${code}. It expires in 15 minutes.`,
      html: `<p>Your password reset code is: <strong>${code}</strong>. It expires in 15 minutes.</p>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      this.logger.warn(`FALLBACK: Reset code for ${email} is: ${code}`);
    }
  }
}
