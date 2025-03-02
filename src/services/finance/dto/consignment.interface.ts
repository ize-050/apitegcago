export enum ConsignmentType {
  ORDER = 'ORDER',
  TOPUP = 'TOPUP'
}

export interface ConsignmentInterface {
  id?: string;
  date: string | Date;
  salespersonId: string;
  documentNumber: string;
  customerId: string;
  type: ConsignmentType;
  
  // Common fields
  amountRMB: number | string;
  transferDate: string | Date;
  notes?: string;
  transferSlipUrl?: string;
  
  // For ORDER type
  productDetails?: string;
  orderStatus?: string;
  
  // For TOPUP type
  topupPlatform?: string;
  topupAccount?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConsignmentCreateDto extends Omit<ConsignmentInterface, 'id' | 'createdAt' | 'updatedAt'> {}
export interface ConsignmentUpdateDto extends Partial<Omit<ConsignmentInterface, 'id' | 'createdAt' | 'updatedAt'>> {}
