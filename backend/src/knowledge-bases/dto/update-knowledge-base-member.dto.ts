import { IsEnum } from 'class-validator';

import { KbMemberRole } from '../../generated/prisma/enums';

export class UpdateKnowledgeBaseMemberDto {
  @IsEnum(KbMemberRole, {
    message: `Role phải là một trong các giá trị sau: ${Object.values(
      KbMemberRole,
    ).join(', ')}`,
  })
  role!: KbMemberRole;
}
