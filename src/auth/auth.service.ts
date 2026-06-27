import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/password-recovery.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async signup(dto: SignupDto): Promise<{ message: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString(); // 6-digit
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // 15 mins expiry

    await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role || UserRole.CUSTOMER,
        verificationCode,
        verificationCodeExpires: expires,
        isVerified: false,
      },
    });

    await this.mailService.sendVerificationCode(dto.email, verificationCode);

    return {
      message: 'Registration successful. Verification code sent to email.',
    };
  }

  async verify(dto: VerifyDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }
    if (!user.verificationCode || user.verificationCode !== dto.code) {
      throw new BadRequestException('Invalid verification code');
    }
    if (
      user.verificationCodeExpires &&
      user.verificationCodeExpires < new Date()
    ) {
      throw new BadRequestException('Verification code has expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    return { message: 'Account verified successfully' };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async refresh(
    userId: string,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Access denied');
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshTokenHash: { not: null },
      },
      data: { refreshTokenHash: null },
    });
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      // Avoid user enumeration, but since we are doing 6-digit confirmation, we let them know
      throw new NotFoundException('User not found');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: code,
        verificationCodeExpires: expires,
      },
    });

    await this.mailService.sendPasswordResetCode(dto.email, code);

    return { message: 'Password reset code sent to email' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.verificationCode || user.verificationCode !== dto.code) {
      throw new BadRequestException('Invalid verification code');
    }
    if (
      user.verificationCodeExpires &&
      user.verificationCodeExpires < new Date()
    ) {
      throw new BadRequestException('Verification code has expired');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationCode: null,
        verificationCodeExpires: null,
        refreshTokenHash: null, // Revoke all sessions on password reset
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  private async updateRefreshTokenHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }

  private async getTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
