import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { USER_SELECT } from './constants/user.constants';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  /*************************************************************
   * HELPERS
   *************************************************************/
  async getUserByIdOrThrow(userId: string, isSelectFull = false) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: isSelectFull ? undefined : USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async checkEmailExists(email: string, userId?: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (user && user.id !== userId) {
      throw new ConflictException('Email đã tồn tại');
    }
  }
}
