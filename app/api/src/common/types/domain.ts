export interface MockProduct {
  productId: number;
  productName: string;
  standardCost: number;
  listPrice: number;
}

export interface MockCustomer {
  customerId: number;
  customerCode: string;
  customerType: string;
  firstName: string;
  lastName: string;
  city: string;
  customerStatus: string;
  paymentTermsDays: number;
  registrationDate: string;
}

export interface MockSalesRep {
  employeeId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface MockSaleLine {
  salesOrderId: number;
  orderDetailId: number;
  dateKey: number;
  fullDate: string;
  year: number;
  quarter: number;
  monthNumber: number;
  monthName: string;
  dayNumber: number;
  customerId: number;
  productId: number;
  employeeId: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  lineTotal: number;
  netSalesWithoutTax: number;
  orderStatus: string;
  paymentStatus: string;
}

export interface WarehouseData {
  products: MockProduct[];
  customers: MockCustomer[];
  salesReps: MockSalesRep[];
  sales: MockSaleLine[];
  dates: string[];
}
