export interface AsaasCustomerData {
  id: string;
  userId: string;
  asaasId: string;
  createdAt: Date;
}

export interface AsaasPaymentData {
  id: string;
  userId: string;
  asaasId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  dueDate: Date;
  paidAt?: Date;
  checkoutUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAsaasPaymentDTO {
  customerId: string;
  value: number;
  dueDate: string; // ISO format
  billingType: PaymentMethod;
  description?: string;
  externalReference?: string;
  callbackUrl?: string;
}
