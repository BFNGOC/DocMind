import {
  IsEmail,
  IsIn,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MemberItemDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @IsIn(['EDITOR', 'VIEWER'], {
    message: 'Role khi thêm thành viên chỉ được là EDITOR hoặc VIEWER',
  })
  role!: 'EDITOR' | 'VIEWER';
}

export class AddMembersDto {
  @IsArray({ message: 'Danh sách thành viên phải là một mảng' })
  @ArrayMinSize(1, { message: 'Danh sách thành viên không được để trống' })
  @ValidateNested({ each: true })
  @Type(() => MemberItemDto)
  members!: MemberItemDto[];
}
