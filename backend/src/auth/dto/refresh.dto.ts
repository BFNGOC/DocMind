import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsString({ message: 'refreshToken phải là một chuỗi' })
  @IsNotEmpty({ message: 'refreshToken không được để trống' })
  refreshToken!: string;
}
