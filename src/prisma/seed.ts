import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample customers
  try {
    await prisma.roles.createMany({
      data: [{
        roles_name: 'Sales',
        createdAt: new Date(),
      },
        {
          roles_name: 'Cs',
          createdAt: new Date(),
        },
        {
          roles_name: 'Hr',
          createdAt: new Date(),
        },
        {
          roles_name: 'Manager',
          createdAt: new Date(),
        },
        {
          roles_name: 'Management',
          createdAt: new Date(),
        }
      ],
    });


    await prisma.customer_group.createMany({
      data: [
        {
         group_name: 'Green A',
         createdAt: new Date(),
        },
        {
          group_name: 'GREEN (B),SHIPPING',
          createdAt: new Date(),
        },
        {
          group_name: 'CLEAR (A) ',
          createdAt: new Date(),
        },
        {
          group_name: 'CLEAR (B) ',
          createdAt: new Date(),
        },
        {
          group_name: 'ALL IN (A)',
          createdAt: new Date(),
        },
        {
          group_name: 'ALL IN (B)',
          createdAt: new Date(),
        },
      ],
    });


    await prisma.customer_group.createMany({
      data: [
        {
          group_name: 'Green A',
          createdAt: new Date(),
        },
        {
          group_name: 'GREEN (B),SHIPPING',
          createdAt: new Date(),
        },
        {
          group_name: 'CLEAR (A) ',
          createdAt: new Date(),
        },
        {
          group_name: 'CLEAR (B) ',
          createdAt: new Date(),
        },
        {
          group_name: 'ALL IN (A)',
          createdAt: new Date(),
        },
        {
          group_name: 'ALL IN (B)',
          createdAt: new Date(),
        },
      ],
    });



  let typemaster:any  =   await prisma.typeMaster.createMany({
      data: [
        {
          type_name: 'IMPORT',
          createdAt: new Date(),
        },
        {
          type_name: 'EXPORT',
          createdAt: new Date(),
        },
        {
          type_name: 'LOCAL',
          createdAt: new Date(),
        }
      ],
    });



      let  TypemasterImport:any = await prisma.typeMaster.findFirst({
      where: {
        type_name:"IMPORT"
      },
     });
       await prisma.documentType.createMany({
        data: [
          {
            type_master_id: TypemasterImport.id,
            do_key: 'Car',
            type_key: 'IMPORT',
            do_name :'ทางรถ',
            createdAt: new Date(),
          },
          {
            type_master_id: TypemasterImport.id,
            do_key: 'BOAT',
            type_key: 'IMPORT',
            do_name :'ทางเรือ',
            createdAt: new Date(),
          },
          {
            type_master_id: TypemasterImport.id,
            do_key: 'AIR',
            type_key: 'IMPORT',
            do_name :'ทางเครื่องบิน',
            createdAt: new Date(),
          },
          {
            type_master_id: TypemasterImport.id,
            do_key: 'TRAIN',
            type_key: 'IMPORT',
            do_name :'ทางราง',
            createdAt: new Date(),
          },
          ]});


    let  Typemasterexport:any = await prisma.typeMaster.findFirst({
      where: {
        type_name:"EXPORT"
      },
    });

    await prisma.documentType.createMany({
      data: [
        {
          type_master_id: Typemasterexport.id,
          do_key: "Car",
          type_key : 'EXPORT',
          do_name :'ทางรถ',
          createdAt: new Date(),
        },
        {
          type_master_id: Typemasterexport.id,
          do_key: 'BOAT',
          type_key : 'EXPORT',
          do_name :'ทางเรือ',
          createdAt: new Date(),
        },
        {
          type_master_id: Typemasterexport.id,
          do_key: 'AIR',
          type_key : 'EXPORT',
          do_name :'ทางเครื่องบิน',
          createdAt: new Date(),
        },
        {
          type_master_id: Typemasterexport.id,
          do_key: 'TRAIN',
          type_key : 'EXPORT',
          do_name :'ทางราง',
          createdAt: new Date(),
        },
      ]});


    let  TypemasterETC:any = await prisma.typeMaster.findFirst({
      where: {
        type_name:"LOCAL"
      },
    });


    await prisma.documentType.createMany({
      data: [
        {
          type_master_id: TypemasterETC.id,
          do_key: "TRUCK",
          type_key : 'LOCAL',
          do_name :'ใบขนพ่วง',
          createdAt: new Date(),
        },
      ]});


    let DocumentTypeImportcar:any = await prisma.documentType.findFirst({
      where:{
        type_key:'IMPORT',
        do_key:'Car'
      }
    })


    await prisma.document.create({
      data: {
        document_type_id: DocumentTypeImportcar.id,
        documennt_type: 'ทางรถ',
        key :"ALL IN",
        document_key:"Document",
        document_so:false,
        document_Invpick:false,
        document_PL:true,
        document_INV:true,
        document_DraftBL:false,
        document_DraftFE:true,
        document_FE:true,
        document_BILL_OF_LADING:false,
        document_ARRIVAL_NOTICE:false,
        Cabinet_deposit:false,
        document_Slip:false,
        document_do:false,
        document_card:false,
        document_draft:true,
        document_hairy:true,
        document_customs_receipt:true,
        document_power_attorney:false,
        document_certificate:false,
        document_world20:false,
        document_tracking:false,
        document_etc:true,
        createdAt: new Date(),
      },
    })


    await prisma.document.create({
       data: {
        document_type_id: DocumentTypeImportcar.id,
        key :"เคลียร์ฝั่งไทย",
         documennt_type: 'ทางรถ',
        document_key:"Document",
        document_so:false,
        document_Invpick:false,
        document_PL:true,
        document_INV:true,
        document_DraftBL:false,
        document_DraftFE:true,
        document_FE:true,
        document_BILL_OF_LADING:false,
        document_ARRIVAL_NOTICE:false,
        Cabinet_deposit:false,
        document_Slip:false,
        document_do:false,
        document_card:false,
        document_draft:true,
        document_hairy:true,
        document_customs_receipt:true,
        document_power_attorney:false,
        document_certificate:false,
        document_world20:false,
        document_tracking:false,
        document_etc:true,
        createdAt: new Date(),
      },
    })


    await prisma.document.create({
      data: {
        document_type_id: DocumentTypeImportcar.id,
        key :"เคลียร์ฝั่งจีน",
        documennt_type: 'ทางรถ',
        document_key:"Document",
        document_so:false,
        document_Invpick:false,
        document_PL:true,
        document_INV:true,
        document_DraftBL:false,
        document_DraftFE:true,
        document_FE:true,
        document_BILL_OF_LADING:false,
        document_ARRIVAL_NOTICE:false,
        Cabinet_deposit:false,
        document_Slip:false,
        document_do:false,
        document_card:false,
        document_draft:false,
        document_hairy:false,
        document_customs_receipt:false,
        document_power_attorney:false,
        document_certificate:false,
        document_world20:false,
        document_tracking:false,
        document_etc:false,
        createdAt: new Date(),
      },
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