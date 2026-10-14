import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { KbMemberRole } from '../generated/prisma/enums';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto';
import { AddMembersDto } from './dto/add-knowledge-base-member.dto';

@Injectable()
export class KnowledgeBasesService {
  constructor(private readonly prisma: PrismaService) {}

  private async findMembership(userId: string, knowledgeBaseId: string) {
    const membership = await this.prisma.knowledgeBaseMember.findUnique({
      where: {
        knowledgeBaseId_userId: {
          knowledgeBaseId,
          userId,
        },
      },
      select: {
        role: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Knowledge Base không tồn tại');
    }

    return membership;
  }

  async create(userId: string, dto: CreateKnowledgeBaseDto) {
    const name = dto.name.trim();

    if (!name) {
      throw new BadRequestException('Tên Knowledge Base không hợp lệ');
    }

    const knowledgeBase = await this.prisma.knowledgeBase.create({
      data: {
        name,
        description: dto.description?.trim() || null,
        members: {
          create: {
            userId,
            role: KbMemberRole.OWNER,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
      },
    });

    return {
      message: 'Tạo Knowledge Base thành công',
      ...knowledgeBase,
    };
  }

  async findAll(userId: string) {
    return this.prisma.knowledgeBase.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            documents: true,
            members: true,
          },
        },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const knowledgeBase = await this.prisma.knowledgeBase.findFirst({
      where: {
        id,
        members: {
          some: { userId },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            userId: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            documents: true,
            conversations: true,
          },
        },
      },
    });

    if (!knowledgeBase) {
      throw new NotFoundException('Knowledge Base không tồn tại');
    }

    return knowledgeBase;
  }

  async update(userId: string, id: string, dto: UpdateKnowledgeBaseDto) {
    const membership = await this.findMembership(userId, id);

    if (
      membership.role !== KbMemberRole.OWNER &&
      membership.role !== KbMemberRole.EDITOR
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật Knowledge Base này',
      );
    }

    if (dto.name !== undefined && !dto.name.trim()) {
      throw new BadRequestException('Tên Knowledge Base không hợp lệ');
    }

    const knowledgeBase = await this.prisma.knowledgeBase.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description?.trim() || null,
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Cập nhật Knowledge Base thành công',
      ...knowledgeBase,
    };
  }

  async remove(userId: string, id: string) {
    const membership = await this.findMembership(userId, id);

    if (membership.role !== KbMemberRole.OWNER) {
      throw new ForbiddenException(
        'Chỉ người sở hữu mới có quyền xóa Knowledge Base',
      );
    }

    await this.prisma.knowledgeBase.delete({
      where: { id },
    });

    return {
      message: 'Xóa Knowledge Base thành công',
    };
  }

  async findMembers(userId: string, knowledgeBaseId: string) {
    await this.findMembership(userId, knowledgeBaseId);

    return this.prisma.knowledgeBaseMember.findMany({
      where: { knowledgeBaseId },
      orderBy: { createdAt: 'asc' },
      select: {
        userId: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async addMembers(
    userId: string,
    knowledgeBaseId: string,
    dto: AddMembersDto,
  ) {
    const operatorMembership = await this.findMembership(
      userId,
      knowledgeBaseId,
    );
    if (operatorMembership.role !== KbMemberRole.OWNER) {
      throw new ForbiddenException(
        'Chỉ người sở hữu mới có quyền thêm thành viên',
      );
    }

    const uniqueInputs = dto.members.filter(
      (member, index, self) =>
        self.findIndex((m) => m.email === member.email) === index,
    );
    const emails = uniqueInputs.map((m) => m.email);

    const existingUsers = await this.prisma.user.findMany({
      where: { email: { in: emails } },
      include: {
        knowledgeBaseMemberships: {
          where: { knowledgeBaseId },
        },
      },
    });

    const dataToInsert: {
      knowledgeBaseId: string;
      userId: string;
      role: KbMemberRole;
    }[] = [];
    const failedList: { email: string; reason: string }[] = [];

    for (const input of uniqueInputs) {
      const user = existingUsers.find((u) => u.email === input.email);

      if (!user) {
        failedList.push({
          email: input.email,
          reason: 'Người dùng chưa có tài khoản trong hệ thống',
        });
        continue;
      }

      if (user.knowledgeBaseMemberships.length > 0) {
        failedList.push({
          email: input.email,
          reason: 'Người dùng đã là thành viên của KB này từ trước',
        });
        continue;
      }

      dataToInsert.push({
        knowledgeBaseId,
        userId: user.id,
        role: input.role,
      });
    }

    if (dataToInsert.length > 0) {
      await this.prisma.knowledgeBaseMember.createMany({
        data: dataToInsert,
        skipDuplicates: true,
      });
    }

    return {
      message: `Xử lý hoàn tất danh sách thành viên.`,
      summary: {
        totalSent: dto.members.length,
        successCount: dataToInsert.length,
        failedCount: failedList.length,
      },
      failedList: failedList,
    };
  }

  async updateMemberRole(
    userId: string,
    knowledgeBaseId: string,
    targetMemberId: string,
    newRole: KbMemberRole,
  ) {
    if (userId === targetMemberId) {
      throw new BadRequestException(
        'Bạn không thể tự thay đổi quyền của chính mình',
      );
    }

    const operatorMembership = await this.findMembership(
      userId,
      knowledgeBaseId,
    );
    if (operatorMembership.role !== KbMemberRole.OWNER) {
      throw new ForbiddenException(
        'Chỉ người sở hữu mới có quyền thay đổi vai trò thành viên',
      );
    }

    const targetMembership = await this.prisma.knowledgeBaseMember.findUnique({
      where: {
        knowledgeBaseId_userId: { knowledgeBaseId, userId: targetMemberId },
      },
    });

    if (!targetMembership) {
      throw new NotFoundException(
        'Thành viên này không tồn tại trong Knowledge Base',
      );
    }

    if (targetMembership.role === KbMemberRole.OWNER) {
      throw new ForbiddenException(
        'Bạn không thể thay đổi vai trò của một người sở hữu khác',
      );
    }

    const member = await this.prisma.knowledgeBaseMember.update({
      where: {
        knowledgeBaseId_userId: { knowledgeBaseId, userId: targetMemberId },
      },
      data: { role: newRole },
    });

    return {
      message: 'Cập nhật vai trò thành viên thành công',
      ...member,
    };
  }

  async removeMember(
    userId: string,
    knowledgeBaseId: string,
    targetMemberId: string,
  ) {
    const operatorMembership = await this.findMembership(
      userId,
      knowledgeBaseId,
    );

    if (userId === targetMemberId) {
      if (operatorMembership.role === KbMemberRole.OWNER) {
        const otherOwner = await this.prisma.knowledgeBaseMember.findFirst({
          where: {
            knowledgeBaseId,
            role: KbMemberRole.OWNER,
            NOT: {
              userId: userId,
            },
          },
        });

        if (!otherOwner) {
          throw new BadRequestException(
            'Bạn là người sở hữu duy nhất còn lại. Vui lòng chuyển quyền OWNER cho thành viên khác trước khi rời nhóm.',
          );
        }
      }

      await this.prisma.knowledgeBaseMember.delete({
        where: {
          knowledgeBaseId_userId: { knowledgeBaseId, userId: targetMemberId },
        },
      });

      return {
        message: 'Rời khỏi Knowledge Base thành công',
      };
    }

    if (operatorMembership.role !== KbMemberRole.OWNER) {
      throw new ForbiddenException(
        'Chỉ người sở hữu mới có quyền xóa thành viên',
      );
    }

    const targetMembership = await this.prisma.knowledgeBaseMember.findUnique({
      where: {
        knowledgeBaseId_userId: { knowledgeBaseId, userId: targetMemberId },
      },
    });

    if (!targetMembership) {
      throw new NotFoundException(
        'Thành viên này không tồn tại trong Knowledge Base',
      );
    }

    if (targetMembership.role === KbMemberRole.OWNER) {
      throw new ForbiddenException(
        'Bạn không thể xóa một người sở hữu khác khỏi Knowledge Base',
      );
    }

    await this.prisma.knowledgeBaseMember.delete({
      where: {
        knowledgeBaseId_userId: { knowledgeBaseId, userId: targetMemberId },
      },
    });

    return {
      message: 'Xóa thành viên khỏi Knowledge Base thành công',
    };
  }
}
