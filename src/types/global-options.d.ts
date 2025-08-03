export type EducationLevel =
  | "NONE"
  | "ELEMENTARY"
  | "ELEMENTARY_INCOMPLETE"
  | "HIGH_SCHOOL"
  | "HIGH_SCHOOL_INCOMPLETE"
  | "COLLEGE"
  | "COLLEGE_INCOMPLETE";

export type UserStatus =
  | "ENROLLING"
  | "AWAITING_CONTRACT"
  | "AWAITING_PAYMENT"
  | "CONTRACT_INVALID"
  | "PAYMENT_FAILED"
  | "ACTIVE";

export type ContractStatus = "PENDING" | "SIGNED" | "REJECTED";

export type PaymentMethod = "PIX" | "BOLETO" | "CREDIT_CARD";

export type PaymentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "RECEIVED"
  | "FAILED"
  | "CANCELED";
