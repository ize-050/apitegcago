export interface Requestcustomer {
  cus_fullname: string;
  cus_phone: string;
  cus_line: string;
  cus_website: string;
  cus_age?: number;
  cus_international?: string;
  cus_sex?: string;
  cus_etc: string;
  cus_facebook?: string;
  updatedAt?: Date
  cus_wechat?: string;
}

export interface RequestcustomerDetail {
  customer_id:string;
  cd_company?: string;
  cd_consider?: string;
  cd_typeinout?: string;
  cd_custype?: string;
  cd_cusservice?: string;
  cd_channels?: string;
  cd_num?: number;
  cd_capital?: string;
  cd_emp?: string;
  cd_shareholders?: string;
  cd_department?: string;
  cd_address?: string;
  cd_num_saka?: string;
  cd_frequency?: string;
  updatedAt: Date;
  cd_leader?: string;
  cd_priority?: string;
}

export interface RequestcustomerStatus {
  customer_id: string;
  cus_status: string;
  active: string;
}


export interface RequestPurchase{
    book_number: string;
    customer_number : string;
    customer_id : string;
    d_route : string;
    d_transport:string;
    d_term : string;
    d_origin : string;
    d_destination : string;
    d_size_cabinet : string;
    d_weight : string;
    d_address_origin : string;
    d_address_destination :string;
    d_refund_tag :string;
    d_truck : string;
    d_etc :string;
}

export interface RequestProduct{
    d_product_name :string;
    d_purchase_id : string;
    review_date? : string;
    performance_rating? :string;

}

export interface RequestProductImage{
    d_product_id : string;
    d_purchase_id : string;
    d_product_image_name :string;
    d_active :boolean;
}

export enum Tagstatus {
    Interested = "สนใจ", // "1" is now the string representation of Interested
    NotInterested = "ไม่สนใจ",
    Continue_follow = "ติดตามต่อ",
    Follow = "ติดต่อไม่ได้",
    CloseSale = "ปิดการขาย",
}