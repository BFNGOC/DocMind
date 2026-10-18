import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateKnowledgeBaseDto {
  @IsString({ message: 'Tên phải là một chuỗi' })
  @MinLength(1, { message: 'Tên phải có ít nhất 1 ký tự' })
  @MaxLength(150, { message: 'Tên không được vượt quá 150 ký tự' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là một chuỗi' })
  @MaxLength(5000, { message: 'Mô tả không được vượt quá 5000 ký tự' })
  description?: string;
}
