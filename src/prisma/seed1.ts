import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample customers
  try {
    await prisma.user.createMany({
        data: [
          {
            fullname: 'adminSale1',
            roles_id: "4bf59e0a-bc96-417f-9f57-b61f58c295f0",
            password: '$2b$10$wJH5Zc1j7VgQ1KvYQ9c2yOy5Qp3J1o9V0J7J4Z0B1e8LZy5Mk8z7u',
            email: 'testSale@gmail.com'
          },
          {
            fullname: 'CustomerSupport',
            roles_id : "69f443db-9ba5-4d5d-9576-c3c2f98fc3ce",
            password: '$2b$10$wJH5Zc1j7VgQ1KvYQ9c2yOy5Qp3J1o9V0J7J4Z0B1e8LZy5Mk8z7u',
            email: 'testcs1@gmail.com'
          }
        
        ]
      });
    
    await prisma.master_status.createMany({
        data:[
            {
                status_key:'Estimate',
                status_name:'Sale ตีราคา',
                status_color:'bg-blue-500'
            },
            {
                status_key:'Send_document',
                status_name:'Sale แนบเอกสาร',
                status_color:'bg-blue-500'
            },
            {
                status_key:'Cancel',
                status_name:'ยกเลิกคำสั่งซื้อ',
                status_color:'bg-blue-500'
            },
            {
                status_key:'Approve',
                status_name:'อนุมัติการสั่งซื้อ',
                status_color:'bg-blue-500'
            },
            {
                status_key:'Wait_document',
                status_name:'Cs ร้องขอเอกสาร',
                status_color:'bg-blue-500'
            },
            {
                status_key:'Bid',
                status_name:'Cs เสนอราคา',
                status_color:'bg-blue-500'
            },
            {
                status_key:"BookContainer",
                status_name:"จองตู้คอนเทนเนอร์",
                status_color:'bg-blue-500'
            },
        ]


    })



    return true
}
  catch(err:any){
    console.log('errSeed',err)


    return false
  }


  }




main()
  .catch((e) => {
    console.error(e);
    // process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });