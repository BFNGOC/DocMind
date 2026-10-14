import {
  IsEmail,
  IsEnum,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { KbMemberRole } from 'src/generated/prisma/enums';

export class MemberItemDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @IsEnum(KbMemberRole, {
    message: `Role phải là một trong các giá trị sau: ${Object.values(
      KbMemberRole,
    ).join(', ')}`,
  })
  role!: KbMemberRole;
}

export class AddMembersDto {
  @IsArray({ message: 'Danh sách thành viên phải là một mảng' })
  @ArrayMinSize(1, { message: 'Danh sách thành viên không được để trống' })
  @ValidateNested({ each: true })
  @Type(() => MemberItemDto)
  members!: MemberItemDto[];
}
