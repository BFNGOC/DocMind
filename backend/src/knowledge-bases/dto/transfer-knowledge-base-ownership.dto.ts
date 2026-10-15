import { IsUUID } from 'class-validator';

export class TransferKnowledgeBaseOwnershipDto {
  @IsUUID(undefined, { message: 'ID thành viên không đúng định dạng UUID' })
  memberId!: string;
}
