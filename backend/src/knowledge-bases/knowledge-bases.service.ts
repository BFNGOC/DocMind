import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '../generated/prisma/client';
import { KbMemberRole } from '../generated/prisma/enums';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto';
import { AddMembersDto } from './dto/add-knowledge-base-member.dto';

@Injectable()
export class KnowledgeBasesService {
  constructor(private readonly prisma: PrismaService) {}

  private async lockKnowledgeBase(
    tx: Prisma.TransactionClient,
    knowledgeBaseId: string,
  ) {
    const knowledgeBases = await tx.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM knowledge_bases
      WHERE id = ${knowledgeBaseId}::uuid
      FOR UPDATE
    `;

    if (knowledgeBases.length === 0) {
      throw new NotFoundException('Knowledge Base không tồn tại');
    }
  }

  private async findMembership(
    tx: Prisma.TransactionClient,
    userId: string,
    knowledgeBaseId: string,
  ) {
    const membership = await tx.knowledgeBaseMember.findUnique({
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
      throw new ForbiddenException(
        'Bạn không phải là thành viên của Knowledge Base này',
      );
    }

    return membership;
  }

  async requireMembership(
    tx: Prisma.TransactionClient,
    userId: string,
    knowledgeBaseId: string,
  ) {
    await this.lockKnowledgeBase(tx, knowledgeBaseId);
    return this.findMembership(tx, userId, knowledgeBaseId);
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
    return this.prisma.$transaction(async (tx) => {
      await this.lockKnowledgeBase(tx, id);
      await this.findMembership(tx, userId, id);

      const knowledgeBase = await tx.knowledgeBase.findUnique({
        where: { id },
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
    });
  }

  async update(userId: string, id: string, dto: UpdateKnowledgeBaseDto) {
    if (dto.name !== undefined && !dto.name.trim()) {
      throw new BadRequestException('Tên Knowledge Base không hợp lệ');
    }

    const knowledgeBase = await this.prisma.$transaction(async (tx) => {
      await this.lockKnowledgeBase(tx, id);
      const membership = await this.findMembership(tx, userId, id);

      if (membership.role === KbMemberRole.VIEWER) {
        throw new ForbiddenException(
          'Bạn không có quyền cập nhật Knowledge Base này',
        );
      }

      return tx.knowledgeBase.update({
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
    });

    return {
      message: 'Cập nhật Knowledge Base thành công',
      ...knowledgeBase,
    };
  }

  async remove(userId: string, id: string) {
    await this.prisma.$transaction(async (tx) => {
      await this.lockKnowledgeBase(tx, id);
      const membership = await this.findMembership(tx, userId, id);

      if (membership.role !== KbMemberRole.OWNER) {
        throw new ForbiddenException(
          'Chỉ người sở hữu mới có quyền xóa Knowledge Base',
        );
      }

      await tx.knowledgeBase.delete({ where: { id } });
    });

    return {
      message: 'Xóa Knowledge Base thành công',
    };
  }

  async findMembers(userId: string, knowledgeBaseId: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.lockKnowledgeBase(tx, knowledgeBaseId);
      await this.findMembership(tx, userId, knowledgeBaseId);

      return tx.knowledgeBaseMember.findMany({
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
    });
  }

  async addMembers(
    userId: string,
    knowledgeBaseId: string,
    dto: AddMembersDto,
  ) {
    const allowedRoles = [KbMemberRole.EDITOR, KbMemberRole.VIEWER];
    if (dto.members.some((member) => !allowedRoles.includes(member.role))) {
      throw new BadRequestException(
        'Chỉ được thêm thành viên với role EDITOR hoặc VIEWER',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await this.lockKnowledgeBase(tx, knowledgeBaseId);
      const operatorMembership = await this.findMembership(
        tx,
        userId,
        knowledgeBaseId,
      );

      if (
        operatorMembership.role !== KbMemberRole.OWNER &&
        operatorMembership.role !== KbMemberRole.ADMIN
      ) {
        throw new ForbiddenException(
          'Chỉ OWNER hoặc ADMIN mới có quyền thêm thành viên',
        );
      }

      const users = await tx.user.findMany({
        where: { email: { in: dto.members.map((member) => member.email) } },
        select: {
          id: true,
          email: true,
          knowledgeBaseMemberships: {
            where: { knowledgeBaseId },
            select: { id: true },
          },
        },
      });
      const usersByEmail = new Map(users.map((user) => [user.email, user]));
      const seenEmails = new Set<string>();
      const failedList: { email: string; reason: string }[] = [];
      let successCount = 0;

      for (const input of dto.members) {
        if (seenEmails.has(input.email)) {
          failedList.push({
            email: input.email,
            reason: 'Email bị trùng trong danh sách gửi lên',
          });
          continue;
        }
        seenEmails.add(input.email);

        const user = usersByEmail.get(input.email);
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

        const result = await tx.knowledgeBaseMember.createMany({
          data: [
            {
              knowledgeBaseId,
              userId: user.id,
              role: input.role,
            },
          ],
          skipDuplicates: true,
        });

        if (result.count === 1) {
          successCount += 1;
        } else {
          failedList.push({
            email: input.email,
            reason: 'Người dùng đã là thành viên của KB này từ trước',
          });
        }
      }

      return {
        message: 'Xử lý hoàn tất danh sách thành viên.',
        summary: {
          totalSent: dto.members.length,
          successCount,
          failedCount: failedList.length,
        },
        failedList,
      };
    });
  }

  async updateMemberRole(
    userId: string,
    knowledgeBaseId: string,
    targetMemberId: string,
    newRole: KbMemberRole,
  ) {
    if (
      newRole !== KbMemberRole.ADMIN &&
      newRole !== KbMemberRole.EDITOR &&
      newRole !== KbMemberRole.VIEWER
    ) {
      throw new BadRequestException('Role phải là ADMIN, EDITOR hoặc VIEWER');
    }

    const member = await this.prisma.$transaction(async (tx) => {
      await this.lockKnowledgeBase(tx, knowledgeBaseId);
      const operatorMembership = await this.findMembership(
        tx,
        userId,
        knowledgeBaseId,
      );

      if (
        operatorMembership.role !== KbMemberRole.OWNER &&
        operatorMembership.role !== KbMemberRole.ADMIN
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền thay đổi vai trò thành viên',
        );
      }

      if (userId === targetMemberId) {
        throw new BadRequestException(
          'Bạn không thể tự thay đổi quyền của chính mình',
        );
      }

      const targetMembership = await tx.knowledgeBaseMember.findUnique({
        where: {
          knowledgeBaseId_userId: { knowledgeBaseId, userId: targetMemberId },
        },
      });

      if (!targetMembership) {
        throw new NotFoundException(
          'Thành viên này không tồn tại trong Knowledge Base',
        );
      }

      if (
        targetMembership.role === KbMemberRole.OWNER ||
        (operatorMembership.role === KbMemberRole.ADMIN &&
          targetMembership.role === KbMemberRole.ADMIN)
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền thay đổi vai trò thành viên này',
        );
      }

      if (
        operatorMembership.role === KbMemberRole.ADMIN &&
        newRole !== KbMemberRole.EDITOR &&
        newRole !== KbMemberRole.VIEWER
      ) {
        throw new ForbiddenException(
          'ADMIN chỉ được chuyển role giữa EDITOR và VIEWER',
        );
      }

      return tx.knowledgeBaseMember.update({
        where: {
          knowledgeBaseId_userId: { knowledgeBaseId, userId: targetMemberId },
        },
        data: { role: newRole },
      });
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
    const selfRemoval = userId === targetMemberId;

    await this.prisma.$transaction(async (tx) => {
      await this.lockKnowledgeBase(tx, knowledgeBaseId);
      const operatorMembership = await this.findMembership(
        tx,
        userId,
        knowledgeBaseId,
      );

      if (selfRemoval) {
        if (operatorMembership.role === KbMemberRole.OWNER) {
          throw new BadRequestException(
            'OWNER không thể rời Knowledge Base trước khi chuyển quyền sở hữu',
          );
        }

        await tx.knowledgeBaseMember.delete({
          where: {
            knowledgeBaseId_userId: {
              knowledgeBaseId,
              userId: targetMemberId,
            },
          },
        });
        return;
      }

      if (
        operatorMembership.role !== KbMemberRole.OWNER &&
        operatorMembership.role !== KbMemberRole.ADMIN
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền xóa thành viên khỏi Knowledge Base',
        );
      }

      const targetMembership = await tx.knowledgeBaseMember.findUnique({
        where: {
          knowledgeBaseId_userId: { knowledgeBaseId, userId: targetMemberId },
        },
      });

      if (!targetMembership) {
        throw new NotFoundException(
          'Thành viên này không tồn tại trong Knowledge Base',
        );
      }

      if (operatorMembership.role === KbMemberRole.ADMIN) {
        if (
          targetMembership.role !== KbMemberRole.EDITOR &&
          targetMembership.role !== KbMemberRole.VIEWER
        ) {
          throw new ForbiddenException(
            'ADMIN chỉ được xóa thành viên có role EDITOR hoặc VIEWER',
          );
        }
      } else if (
        operatorMembership.role !== KbMemberRole.OWNER ||
        targetMembership.role === KbMemberRole.OWNER
      ) {
        throw new ForbiddenException('Bạn không có quyền xóa thành viên này');
      }

      await tx.knowledgeBaseMember.delete({
        where: {
          knowledgeBaseId_userId: { knowledgeBaseId, userId: targetMemberId },
        },
      });
    });

    return {
      message: selfRemoval
        ? 'Rời khỏi Knowledge Base thành công'
        : 'Xóa thành viên khỏi Knowledge Base thành công',
    };
  }

  async transferOwnership(
    userId: string,
    knowledgeBaseId: string,
    targetMemberId: string,
  ) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await this.lockKnowledgeBase(tx, knowledgeBaseId);
        const operatorMembership = await this.findMembership(
          tx,
          userId,
          knowledgeBaseId,
        );

        if (operatorMembership.role !== KbMemberRole.OWNER) {
          throw new ForbiddenException(
            'Chỉ OWNER hiện tại mới có thể chuyển quyền sở hữu',
          );
        }

        if (userId === targetMemberId) {
          throw new BadRequestException(
            'Bạn không thể chuyển quyền sở hữu cho chính mình',
          );
        }

        const targetMembership = await tx.knowledgeBaseMember.findUnique({
          where: {
            knowledgeBaseId_userId: {
              knowledgeBaseId,
              userId: targetMemberId,
            },
          },
        });

        if (!targetMembership) {
          throw new NotFoundException(
            'Người nhận phải là thành viên của Knowledge Base này',
          );
        }

        await tx.knowledgeBaseMember.update({
          where: {
            knowledgeBaseId_userId: { knowledgeBaseId, userId },
          },
          data: { role: KbMemberRole.ADMIN },
        });
        await tx.knowledgeBaseMember.update({
          where: {
            knowledgeBaseId_userId: {
              knowledgeBaseId,
              userId: targetMemberId,
            },
          },
          data: { role: KbMemberRole.OWNER },
        });
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Không thể hoàn tất chuyển quyền sở hữu do trạng thái thành viên đã thay đổi',
        );
      }
      throw error;
    }

    return {
      message: 'Chuyển quyền sở hữu Knowledge Base thành công',
    };
  }
}
