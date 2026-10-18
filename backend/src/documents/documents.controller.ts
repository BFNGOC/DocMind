import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth-jwt-user.type';
import { DocumentsService } from './documents.service';

@Controller('knowledge-bases/:id/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) knowledgeBaseId: string,
  ) {
    return this.documentsService.findAll(user.id, knowledgeBaseId);
  }

  @Get(':documentId')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) knowledgeBaseId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    return this.documentsService.findOne(user.id, knowledgeBaseId, documentId);
  }

  @Delete(':documentId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) knowledgeBaseId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    return this.documentsService.remove(user.id, knowledgeBaseId, documentId);
  }
}
