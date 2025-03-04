export interface TransactionInterface {
  id?: string;
  type: string;
  customerDepositId?: string;
  consignmentId?: string;
  date: Date | string;
  documentNumber: string;
  customerId: string;
  salespersonId: string;
  amountRMB: number;
  transferDate: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface TransactionCreateDto extends Omit<TransactionInterface, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}
export interface TransactionUpdateDto extends Partial<Omit<TransactionInterface, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>> {}
