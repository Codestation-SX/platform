export interface ContractData {
  id: string;
  userId: string;
  pdfUrl: string;
  signedAt: Date | null;
  isValid: boolean;
  status: ContractStatus;
}
