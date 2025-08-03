export function formatWithMask(value: string, mask: string): string {
  let i = 0;
  const clean = value.replace(/\D/g, "");
  return mask.replace(/9/g, () => clean[i++] ?? "");
}
