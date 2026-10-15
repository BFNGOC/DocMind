import { Module } from '@nestjs/common';
import { KnowledgeBasesModule } from '../knowledge-bases/knowledge-bases.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [KnowledgeBasesModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
