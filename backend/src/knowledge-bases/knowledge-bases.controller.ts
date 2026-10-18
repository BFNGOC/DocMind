import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-knowledge-base.dto';
import { KnowledgeBasesService } from './knowledge-bases.service';
import type { AuthUser } from 'src/auth/types/auth-jwt-user.type';
import { AddMembersDto } from './dto/add-knowledge-base-member.dto';
import { UpdateKnowledgeBaseMemberDto } from './dto/update-knowledge-base-member.dto';
import { TransferKnowledgeBaseOwnershipDto } from './dto/transfer-knowledge-base-ownership.dto';

@Controller('knowledge-bases')
@UseGuards(JwtAuthGuard)
export class KnowledgeBasesController {
  constructor(private readonly knowledgeBasesService: KnowledgeBasesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateKnowledgeBaseDto) {
    return this.knowledgeBasesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.knowledgeBasesService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.knowledgeBasesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateKnowledgeBaseDto,
  ) {
    return this.knowledgeBasesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.knowledgeBasesService.remove(user.id, id);
  }

  @Get(':id/members')
  findMembers(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.knowledgeBasesService.findMembers(user.id, id);
  }

  @Post(':id/members')
  addMembers(
    @Param('id', ParseUUIDPipe) knowledgeBaseId: string,
    @CurrentUser() user: AuthUser,
    @Body() addMembersDto: AddMembersDto,
  ) {
    return this.knowledgeBasesService.addMembers(
      user.id,
      knowledgeBaseId,
      addMembersDto,
    );
  }

  @Patch(':id/owner')
  transferOwnership(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferKnowledgeBaseOwnershipDto,
  ) {
    return this.knowledgeBasesService.transferOwnership(
      user.id,
      id,
      dto.memberId,
    );
  }

  @Patch(':id/members/:memberId')
  updateMemberRole(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,

    @Body() dto: UpdateKnowledgeBaseMemberDto,
  ) {
    return this.knowledgeBasesService.updateMemberRole(
      user.id,
      id,
      memberId,
      dto.role,
    );
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.knowledgeBasesService.removeMember(user.id, id, memberId);
  }
}
