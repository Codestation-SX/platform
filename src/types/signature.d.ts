export interface SignatureData {
  id: string;
  contractId: string;
  signatureImage: string;
  ipAddress?: string;
  userAgent?: string;
  signedAt: Date;
}
