import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { randomBytes, scrypt } from 'node:crypto';
import { PrismaClient, UserRole } from '../src/generated/prisma/client';
import 'dotenv/config';

// Initialize Prisma Client with PostgreSQL adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

//Hash password
function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

async function main() {
  const passwordHash = await hashPassword('123456');

  /********************
   * 1. USERS
   ********************/
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'System Admin',
      passwordHash,
      role: UserRole.ADMIN,
      avatarUrl: null,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@gmail.com' },
    update: {},
    create: {
      email: 'user@gmail.com',
      name: 'User Default',
      passwordHash,
      role: UserRole.USER,
      avatarUrl: null,
    },
  });

  console.log('🎉 Seed completed!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Failed to seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
