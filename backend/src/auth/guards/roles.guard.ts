import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from 'src/generated/prisma/enums';
import { AuthUser } from '../types/auth-jwt-user.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Endpoint không khai báo role thì không giới hạn role tại guard này.
    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
    }>();

    // 1. Kiểm tra nếu user chưa được đính kèm vào request (do chưa qua JwtAuthGuard)
    if (!request.user) {
      throw new ForbiddenException(
        'Bạn cần đăng nhập để thực hiện hành động này',
      );
    }

    // 2. Kiểm tra nếu quyền (role) của user không nằm trong danh sách quyền yêu cầu
    const hasRole = requiredRoles.includes(request.user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập vào tài nguyên này',
      );
    }

    return true;
  }
}
