import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import type { AuthUser } from 'src/auth/types/auth-jwt-user.type';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.userService.getMe(user.id);
  }
}
