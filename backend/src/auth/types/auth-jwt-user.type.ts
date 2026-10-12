import { UserRole } from 'src/generated/prisma/enums';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}
