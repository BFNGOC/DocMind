import { IsIn } from 'class-validator';

export class UpdateKnowledgeBaseMemberDto {
  @IsIn(['ADMIN', 'EDITOR', 'VIEWER'], {
    message: 'Role phải là ADMIN, EDITOR hoặc VIEWER',
  })
  role!: 'ADMIN' | 'EDITOR' | 'VIEWER';
}
