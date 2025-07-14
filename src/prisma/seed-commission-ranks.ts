import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding commission ranks...');

  // ลบข้อมูลเดิมทั้งหมด
  await prisma.commission_rank.deleteMany({});
  console.log('✅ Cleared existing commission ranks');

  const commissionRanksData = [
    // ALL IN - งานครบวงจร
    {
      work_type: 'ALL IN',
      min_amount: 0,
      max_amount: 50000,
      percentage: 3.0,
    },
    // {
    //   work_type: 'ALL IN',
    //   min_amount: 50001,
    //   max_amount: 100000,
    //   percentage: 4.0,
    // },
    // {
    //   work_type: 'ALL IN',
    //   min_amount: 100001,
    //   max_amount: 200000,
    //   percentage: 5.0,
    // },
    // {
    //   work_type: 'ALL IN',
    //   min_amount: 200001,
    //   max_amount: 500000,
    //   percentage: 6.0,
    // },
    // {
    //   work_type: 'ALL IN',
    //   min_amount: 500001,
    //   max_amount: 999999999,
    //   percentage: 7.0,
    // },

    // เคลียร์ฝั่งไทย - อัตราต่ำกว่าเล็กน้อย
    {
      work_type: 'เคลียร์ฝั่งไทย',
      min_amount: 0,
      max_amount: 30000,
      percentage: 2.0,
    },
    // {
    //   work_type: 'เคลียร์ฝั่งไทย',
    //   min_amount: 30001,
    //   max_amount: 70000,
    //   percentage: 3.0,
    // },
    // {
    //   work_type: 'เคลียร์ฝั่งไทย',
    //   min_amount: 70001,
    //   max_amount: 150000,
    //   percentage: 4.0,
    // },
    // {
    //   work_type: 'เคลียร์ฝั่งไทย',
    //   min_amount: 150001,
    //   max_amount: 300000,
    //   percentage: 5.0,
    // },
    // {
    //   work_type: 'เคลียร์ฝั่งไทย',
    //   min_amount: 300001,
    //   max_amount: 999999999,
    //   percentage: 6.0,
    // },

    // เคลียร์ฝั่งจีน - อัตราต่ำกว่าเล็กน้อย
    {
      work_type: 'เคลียร์ฝั่งจีน',
      min_amount: 0,
      max_amount: 35000,
      percentage: 2.5,
    },
    // {
    //   work_type: 'เคลียร์ฝั่งจีน',
    //   min_amount: 35001,
    //   max_amount: 80000,
    //   percentage: 3.5,
    // },
    // {
    //   work_type: 'เคลียร์ฝั่งจีน',
    //   min_amount: 80001,
    //   max_amount: 180000,
    //   percentage: 4.5,
    // },
    // {
    //   work_type: 'เคลียร์ฝั่งจีน',
    //   min_amount: 180001,
    //   max_amount: 350000,
    //   percentage: 5.5,
    // },
    // {
    //   work_type: 'เคลียร์ฝั่งจีน',
    //   min_amount: 350001,
    //   max_amount: 999999999,
    //   percentage: 6.5,
    // },

    // GREEN - อัตราต่ำ
    {
      work_type: 'GREEN',
      min_amount: 0,
      max_amount: 20000,
      percentage: 1.5,
    },
    // {
    //   work_type: 'GREEN',
    //   min_amount: 20001,
    //   max_amount: 50000,
    //   percentage: 2.0,
    // },
    // {
    //   work_type: 'GREEN',
    //   min_amount: 50001,
    //   max_amount: 100000,
    //   percentage: 2.5,
    // },
    // {
    //   work_type: 'GREEN',
    //   min_amount: 100001,
    //   max_amount: 999999999,
    //   percentage: 3.0,
    // },

    // FOB - อัตราต่ำ
    {
      work_type: 'FOB',
      min_amount: 0,
      max_amount: 25000,
      percentage: 1.5,
    },
    // {
    //   work_type: 'FOB',
    //   min_amount: 25001,
    //   max_amount: 60000,
    //   percentage: 2.0,
    // },
    // {
    //   work_type: 'FOB',
    //   min_amount: 60001,
    //   max_amount: 120000,
    //   percentage: 2.5,
    // },
    // {
    //   work_type: 'FOB',
    //   min_amount: 120001,
    //   max_amount: 999999999,
    //   percentage: 3.0,
    // },

    // EXW - อัตราต่ำสุด
    {
      work_type: 'EXW',
      min_amount: 0,
      max_amount: 15000,
      percentage: 1.0,
    },
    // {
    //   work_type: 'EXW',
    //   min_amount: 15001,
    //   max_amount: 40000,
    //   percentage: 1.5,
    // },
    // {
    //   work_type: 'EXW',
    //   min_amount: 40001,
    //   max_amount: 80000,
    //   percentage: 2.0,
    // },
    // {
    //   work_type: 'EXW',
    //   min_amount: 80001,
    //   max_amount: 999999999,
    //   percentage: 2.5,
    // },

    // CIF - อัตรากลาง
    {
      work_type: 'CIF',
      min_amount: 0,
      max_amount: 40000,
      percentage: 2.0,
    },
    // {
    //   work_type: 'CIF',
    //   min_amount: 40001,
    //   max_amount: 90000,
    //   percentage: 3.0,
    // },
    // {
    //   work_type: 'CIF',
    //   min_amount: 90001,
    //   max_amount: 180000,
    //   percentage: 4.0,
    // },
    // {
    //   work_type: 'CIF',
    //   min_amount: 180001,
    //   max_amount: 999999999,
    //   percentage: 5.0,
    // },

    // CUSTOMER CLEAR - อัตราต่ำ
    {
      work_type: 'CUSTOMER CLEAR',
      min_amount: 0,
      max_amount: 20000,
      percentage: 1.0,
    },
    // {
    //   work_type: 'CUSTOMER CLEAR',
    //   min_amount: 20001,
    //   max_amount: 50000,
    //   percentage: 1.5,
    // },
    // {
    //   work_type: 'CUSTOMER CLEAR',
    //   min_amount: 50001,
    //   max_amount: 100000,
    //   percentage: 2.0,
    // },
    // {
    //   work_type: 'CUSTOMER CLEAR',
    //   min_amount: 100001,
    //   max_amount: 999999999,
    //   percentage: 2.5,
    // },
  ];

  // เพิ่มข้อมูลทั้งหมด
  for (const data of commissionRanksData) {
    await prisma.commission_rank.create({
      data: data,
    });
  }

  console.log(`✅ Created ${commissionRanksData.length} commission ranks`);
  
  // แสดงสรุปข้อมูลที่เพิ่ม
  const summary = await prisma.commission_rank.groupBy({
    by: ['work_type'],
    _count: {
      work_type: true,
    },
  });

  console.log('\n📊 Summary by work type:');
  summary.forEach((item) => {
    console.log(`   ${item.work_type}: ${item._count.work_type} ranks`);
  });

  console.log('\n🎉 Commission ranks seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding commission ranks:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });