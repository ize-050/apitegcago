import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      cus_fullname: 'John Doe',
      cus_phone: '1234567890',
      cus_line: 'john_line',
      cus_website: 'https://johndoe.com',
      cus_etc: 'Other information',
      cus_facebook: 'john_facebook',
      cus_wechat: 'john_wechat',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      cus_fullname: 'Jane Smith',
      cus_phone: '0987654321',
      cus_line: 'jane_line',
      cus_website: 'https://janesmith.com',
      cus_etc: 'Other information',
      cus_facebook: 'jane_facebook',
      cus_wechat: 'jane_wechat',
    },
  });

  // Create sample customer details for the first customer
  await prisma.customer_detail.create({
    data: {
      customer_id: customer1.id,
      cd_consider: 'Consideration 1',
      cd_typeinout: 'In',
      cd_custype: 'Type A',
      cd_cusservice: 'Service 1',
      cd_channels: 'Online',
      cd_num: 10,
      cd_capital: '10000 USD',
      cd_emp: '100',
      cd_shareholders: 'Shareholders info 1',
      cd_address: '123 Main St',
      cd_num_saka: 'Saka 1',
      cd_frequency: 'Monthly',
      cd_leader: 'Leader 1',
      cd_priority: 'High',
    },
  });

  // Create sample customer details for the second customer
  await prisma.customer_detail.create({
    data: {
      customer_id: customer2.id,
      cd_consider: 'Consideration 2',
      cd_typeinout: 'Out',
      cd_custype: 'Type B',
      cd_cusservice: 'Service 2',
      cd_channels: 'Offline',
      cd_num: 20,
      cd_capital: '20000 USD',
      cd_emp: '200',
      cd_shareholders: 'Shareholders info 2',
      cd_address: '456 Main St',
      cd_num_saka: 'Saka 2',
      cd_frequency: 'Weekly',
      cd_leader: 'Leader 2',
      cd_priority: 'Medium',
    },
  });

  console.log('Seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });