import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { USER_SELECT } from 'src/user/constants/user.constants';
import { UserRole } from 'src/generated/prisma/enums';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const accessSecret =
      this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    const accessExpiresIn = this.configService.getOrThrow<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as JwtSignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as JwtSignOptions['expiresIn'],
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    await this.userService.checkEmailExists(email);

    const passwordHash = await argon2.hash(dto.password);

    await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash,
      },
    });

    return {
      message: 'Đăng ký thành công',
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { ...USER_SELECT, passwordHash: true },
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    const isMatch = await argon2.verify(user.passwordHash, dto.password);

    if (!isMatch) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const refreshTokenHash = await argon2.hash(tokens.refreshToken);

    const [, updatedUser] = await this.prisma.$transaction([
      this.prisma.authSession.create({
        data: { userId: user.id, refreshTokenHash },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
        select: USER_SELECT,
      }),
    ]);

    return {
      message: 'Đăng nhập thành công',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: updatedUser,
    };
  }

  async refresh(refreshToken: string) {
    // 1. Xác minh chữ ký và thời hạn của refresh token
    let payload: {
      sub: string;
      email: string;
      role: UserRole;
    };

    try {
      const refreshSecret =
        this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

      payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: UserRole;
      }>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    // 2. Tìm các session còn hoạt động của user
    const sessions = await this.prisma.authSession.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
      },
      select: {
        id: true,
        refreshTokenHash: true,
      },
    });

    // 3. Tìm chính xác session chứa refresh token hiện tại
    let matchedSession: (typeof sessions)[number] | null = null;

    for (const session of sessions) {
      if (await argon2.verify(session.refreshTokenHash, refreshToken)) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      throw new UnauthorizedException(
        'Session không hợp lệ hoặc đã bị thu hồi',
      );
    }

    // 4. Kiểm tra user còn tồn tại
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      select: USER_SELECT,
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    // 5. Tạo cặp token mới bằng hàm có sẵn
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // 6. Hash refresh token mới
    const newRefreshTokenHash = await argon2.hash(tokens.refreshToken);

    // 7. Thay hash cũ bằng hash mới theo cách nguyên tử
    // Chỉ request đầu tiên cập nhật được session với hash cũ.
    const result = await this.prisma.authSession.updateMany({
      where: {
        id: matchedSession.id,
        refreshTokenHash: matchedSession.refreshTokenHash,
        revokedAt: null,
      },
      data: {
        refreshTokenHash: newRefreshTokenHash,
      },
    });

    if (result.count !== 1) {
      throw new UnauthorizedException(
        'Refresh token đã được sử dụng hoặc session không còn hợp lệ',
      );
    }

    // 8. Trả cả access token và refresh token mới
    return {
      message: 'Làm mới token thành công',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
