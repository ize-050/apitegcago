import { PrismaClient } from '@prisma/client';

// ประกาศตัวแปร global สำหรับเก็บ PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

// กำหนดค่า connection pool ที่เหมาะสม
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    // กำหนดค่า connection pool ที่เหมาะสม
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// สร้าง PrismaClient เพียงตัวเดียวและใช้ร่วมกัน
const prismaInstance = global.prisma || prismaClientSingleton();

// จัดการ connection lifecycle
// ปิดการเชื่อมต่อเมื่อแอปพลิเคชันปิดตัวลง
process.on('SIGINT', async () => {
  console.log('Closing Prisma connections due to SIGINT...');
  await prismaInstance.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing Prisma connections due to SIGTERM...');
  await prismaInstance.$disconnect();
  process.exit(0);
});

process.on('beforeExit', async () => {
  console.log('Closing Prisma connections before exit...');
  await prismaInstance.$disconnect();
});

process.on('exit', () => {
  console.log('Prisma connections closed.');
});

// ในโหมด development เก็บ prisma ไว้ใน global เพื่อไม่ให้มีการสร้างหลายตัวเมื่อมีการ hot reload
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaInstance;
}

// สร้างฟังก์ชันสำหรับรีเซ็ตการเชื่อมต่อเมื่อเกิดข้อผิดพลาด
export async function resetPrismaConnection() {
  try {
    console.log('Resetting Prisma connection...');
    await prismaInstance.$disconnect();
    await prismaInstance.$connect();
    console.log('Prisma connection reset successfully.');
  } catch (error) {
    console.error('Failed to reset Prisma connection:', error);
  }
}

// Export prisma instance
export const prisma = prismaInstance;
