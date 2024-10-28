import { z } from "zod";
// import { isValidStatus, isValidTag } from '../utils/validationUtils'; // Assuming you have validation helper functions

export const ValidationCreateCustomer = z.object({
  cus_fullname: z.string({ message: "cus_fullname is missing" }),
  cus_phone: z.string({ message: "cus_phone is missing" }).min(10,{message: "cus_phone length 10"}),
  cus_line: z.string({ message: "cus_line is missing" }),
  cus_etc: z.string({ message: "cus_etc is missing" }),
  cus_status: z.string({ message: "cus_status is missing" }),
});


export const ValidationEditCustomer =z.object({
  cus_fullname: z.string({ message: "cus_fullname is missing" }),
  cus_phone: z.string({ message: "cus_phone is missing" }).min(10,{message: "cus_phone length 10"}),
  cus_line: z.string({ message: "cus_line is missing" }),
  cus_etc: z.string({ message: "cus_etc is missing" }),
  cus_status: z.string({ message: "cus_status is missing" }),

})


export const ValidationsubmitEstimate =z.object({
  book_number:z.string({ message: "book_number is missing"}),
  d_route : z.string({ message: "Estimate_route is missing"}),
  d_transport :z.string({message:"Estimate_transport is missing"}),
  d_term : z.string({message:"Estimate_Term is missing"}),
  link_d_origin:z.string({message:"Estimate_link_origin is missing"}),
  link_d_destination:z.string({message:"Estimate_link_destination is missing"}),
  date_cabinet:z.string({message:"Estimate_date_cabinet is missing"}),
  d_product:z.string({message:"Estimate_product is missing"}),
  // d_image: z.instanceof(File, { message: "d_image must be a File object" }),
  d_origin :z.string({message:"Estimate_origin is missing"}), //ต้นทาง
  d_destination:z.string({message:"Estimate_destination is missing"}), //ปลายทาง
  d_size_cabinet:z.string({message:"Estimate_size_cabinet is missing"}), // ขนาดไซส์
  d_weight :z.string({message:"Estimate_weight"}), //น้ำหนัก,
  d_address_origin :z.string({message:"Estimate_address"}), //ที่อยู่ต้นทาง
  d_address_destination:z.string({message:"Estimate_address_destnation"}), //ที่อยู่ปลายทาง
  //d_refund_tag :z.string({message:"Estimate_refund"}), //Refung tax ต้นทาง
  d_truck :z.string({message:"d_truck"}) , //หัวรถลาก
  d_etc :z.string({message:"d_etc"}) , //หมายเหตุุ
})