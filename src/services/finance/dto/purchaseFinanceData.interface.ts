import { 
  FinanceInterface, 
  PaymentDetailsInterface, 
  TaxReturnInterface, 
  ChinaExpensesInterface, 
  ThailandExpensesInterface, 
  PortExpensesInterface, 
  DOExpensesInterface, 
  ShippingDetailsInterface 
} from './finance.interface';

export interface PurchaseFinanceDataInterface {
  purchaseFinanceData: FinanceInterface;
  paymentData: PaymentDetailsInterface;
  taxReturnData: TaxReturnInterface;
  chinaExpensesData: ChinaExpensesInterface;
  thailandExpensesData: ThailandExpensesInterface;
  portExpensesData: PortExpensesInterface;
  doExpensesData: DOExpensesInterface;
  shippingData: ShippingDetailsInterface;
}
