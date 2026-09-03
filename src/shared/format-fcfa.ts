export function formatFcfa(amount: string | bigint): string {
  const value = typeof amount === "bigint" ? amount : BigInt(amount);
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)} FCFA`;
}
