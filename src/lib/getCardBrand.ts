// lib/getCardBrand.ts
export function getCardBrand(cardNumber: string): string | null {
  const sanitized = cardNumber.replace(/\D/g, "");

  if (/^4\d{0,15}/.test(sanitized)) return "Visa";
  if (/^5[1-5]\d{0,14}/.test(sanitized)) return "MasterCard";
  if (/^3[47]\d{0,13}/.test(sanitized)) return "Amex";
  if (/^3(?:0[0-5]|[68])\d{0,11}/.test(sanitized)) return "Diners";
  if (/^6(?:011|5\d{2})\d{0,12}/.test(sanitized)) return "Discover";
  if (/^(606282|3841)/.test(sanitized)) return "Hipercard";
  if (
    /^(4011|4389|4514|4576|5041|5067|5090|6277|6362|6504|6505|6516|6550)/.test(
      sanitized
    )
  )
    return "Elo";

  return null;
}
