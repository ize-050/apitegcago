import { PrismaClient } from '@prisma/client';

// สร้าง PrismaClient เป็น singleton เพื่อลดจำนวนการเชื่อมต่อกับฐานข้อมูล
// ใช้ global เพื่อให้มั่นใจว่ามีเพียง instance เดียวในทุกการเรียกใช้
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
  // ตั้งค่าเพิ่มเติมเพื่อจัดการกับการเชื่อมต่อ
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  }
});

// ในโหมด development ให้เก็บ prisma ไว้ใน global เพื่อไม่ให้มีการสร้าง connection ใหม่ทุกครั้งที่มีการ hot reload
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
