export interface FinanceInterface {
    id?: string;
    d_purchase_id?: string;
    work_id?: string; // Added for frontend compatibility
    finance_status?: string; // Added to fix TS error
    
    // ข้อมูลตู้
    container_number?: string;
    container_size?: string;
    seal_number?: string;
    

    
    // ข้อมูลเรือ
    ship_name?: string;
    
    // ข้อมูลท่าเรือ
    port_load?: string;
    port_discharge?: string;
    
    // ข้อมูลวันที่
    etd_date?: string;
    eta_date?: string;
    
    // ข้อมูลการเงิน
    billing_code?: string;
    billing_amount?: string;
    total_before_vat?: string;
    vat_amount?: string;
    total_after_vat?: string;
    
    // ข้อมูลการชำระเงิน
    payment_date_1?: string;
    payment_date_2?: string;
    payment_date_3?: string;
    payment_amount_1?: string;
    payment_amount_2?: string;
    payment_amount_3?: string;
    remaining_amount_1?: string;
    remaining_amount_2?: string;
    remaining_amount_3?: string;
    payment_status?: string;
    
    // ข้อมูลคืนภาษีจากตู้
    tax_return_checked?: boolean;
    tax_return_amount?: string;
    tax_return_date?: string;
    
    // ข้อมูลกำไรและค่าบริหารจัดการ
    management_fee?: string;
    percentage_fee?: string;
    net_profit?: string;
    profit_loss?: string;
    
    // ข้อมูลการคำนวณ
    total_payment_all?: string; // Added to fix TS error
    miss_payment?: string; // Added to fix TS error
    price_service?: string; // Added to fix TS error
    total_profit_loss?: string; // Added to fix TS error
    text_profit_loss?: string; // Added to fix TS error
    
    // ข้อมูลค่าใช้จ่ายจีน
    china_expenses?: ChinaExpensesInterface;
    
    // ข้อมูลค่าใช้จ่ายไทย
    thailand_expenses?: ThailandExpensesInterface;
    
    // ข้อมูลค่าใช้จ่ายท่าเรือ
    port_expenses?: PortExpensesInterface;
    
    // ข้อมูลค่าใช้จ่าย D/O
    do_expenses?: DOExpensesInterface;
    
    // ข้อมูลค่าใช้จ่ายขนส่ง
    shipping_details?: ShippingDetailsInterface;
    
    // ข้อมูลความสัมพันธ์
    payment_details?: PaymentDetailsInterface;
    tax_return?: TaxReturnInterface;
}

export interface PaymentDetailsInterface {
    id?: string;
    purchase_finance_id?: string;
    
    payment_date_1?: string;
    payment_date_2?: string;
    payment_date_3?: string;
    
    payment_amount_1?: string;
    payment_amount_2?: string;
    payment_amount_3?: string;
    remaining_amount_1?: string;
    remaining_amount_2?: string;
    remaining_amount_3?: string;
    payment_status?: string;
}

export interface TaxReturnInterface {
    id?: string;
    purchase_finance_id?: string;
    
    // ข้อมูลคืนภาษีจากตู้
    tax_return_checked?: boolean;
    tax_return_amount?: string;
    tax_return_date?: string;
    
    // ข้อมูลกำไรและค่าบริหารจัดการ
    management_fee?: string;
    percentage_fee?: string;
    net_profit?: string;
    profit_loss?: string;
}

export interface ChinaExpensesInterface {
    id?: string;
    purchase_finance_id?: string;
    
    ch_freight?: string;
    ch_exchange_rate?: string;
    ch_freight_total?: string;
}

export interface ThailandExpensesInterface {
    id?: string;
    purchase_finance_id?: string;
    th_duty?: string;
    th_tax?: string;
    th_employee?: string;
    th_warehouse?: string;
    th_custom_fees?: string;
    th_overtime?: string;
    th_check_fee?: string;
    th_product_account?: string;
    th_license_fee?: string;
    th_gasoline?: string;
    th_hairy?: string;
    th_other_fee?: string;
    th_port_name?: string;
    th_port_fee?: string;
    th_lift_on_off?: string;
    th_ground_fee?: string;
    th_port_other_fee?: string;
    th_other_expenses?: string;
    th_total_expenses?: string;
    amount_payment_do?: string;
    price_deposit?: string;
}

export interface PortExpensesInterface {
    id?: string;
    purchase_finance_id?: string;
    
    th_port_name?: string; // Added to fix TS error
    th_port_fee?: string;
    th_lift_on_off?: string;
    th_ground_fee?: string;
    th_port_other_fee?: string;
    th_price_head_tractor?: string;
    th_total_port_fee?: string;
}

export interface DOExpensesInterface {
    id?: string;
    purchase_finance_id?: string;
    
    amount_payment_do?: string;
    price_deposit?: string;
}

export interface ShippingDetailsInterface {
    id?: string;
    purchase_finance_id?: string;
    th_shipping_price?: string;
    th_shipping_note?: string; // Added to fix TS error
    th_shipping_advance?: string;
    th_shipping_remaining?: string;
    th_shipping_return_to?: string;
    th_total_shipping?: string;
}

export interface FinancialRecordInterface {
    id: string;
    date: string;
    documentNumber: string;
    amount: number;
    transferType: string;
    description: string;
    salesperson: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}