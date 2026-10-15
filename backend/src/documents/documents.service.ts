import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KbMemberRole } from '../generated/prisma/enums';
import { KnowledgeBasesService } from '../knowledge-bases/knowledge-bases.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly knowledgeBasesService: KnowledgeBasesService,
  ) {}

  async findAll(userId: string, knowledgeBaseId: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.knowledgeBasesService.requireMembership(
        tx,
        userId,
        knowledgeBaseId,
      );

      const documents = await tx.document.findMany({
        where: { knowledgeBaseId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          fileSize: true,
          mimeType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return documents.map((document) => ({
        ...document,
        fileSize: document.fileSize.toString(),
      }));
    });
  }

  async findOne(userId: string, knowledgeBaseId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.knowledgeBasesService.requireMembership(
        tx,
        userId,
        knowledgeBaseId,
      );

      const document = await tx.document.findFirst({
        where: { id: documentId, knowledgeBaseId },
        select: {
          id: true,
          name: true,
          fileSize: true,
          mimeType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!document) {
        throw new NotFoundException(
          'Tài liệu không tồn tại trong Knowledge Base này',
        );
      }

      return {
        ...document,
        fileSize: document.fileSize.toString(),
      };
    });
  }

  async remove(userId: string, knowledgeBaseId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const membership = await this.knowledgeBasesService.requireMembership(
        tx,
        userId,
        knowledgeBaseId,
      );

      if (membership.role === KbMemberRole.VIEWER) {
        throw new ForbiddenException(
          'Bạn không có quyền xóa tài liệu trong Knowledge Base này',
        );
      }

      const result = await tx.document.deleteMany({
        where: { id: documentId, knowledgeBaseId },
      });

      if (result.count === 0) {
        throw new NotFoundException(
          'Tài liệu không tồn tại trong Knowledge Base này',
        );
      }

      return { message: 'Xóa tài liệu thành công' };
    });
  }
}
