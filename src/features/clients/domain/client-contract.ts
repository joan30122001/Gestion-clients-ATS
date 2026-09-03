export function calculateContractTotal(durationMonths: string, monthlyAmount: string): string {
  return (BigInt(durationMonths) * BigInt(monthlyAmount)).toString();
}

export function isCustomContractTotal(durationMonths: string, monthlyAmount: string, totalAmount: string): boolean {
  return calculateContractTotal(durationMonths, monthlyAmount) !== BigInt(totalAmount).toString();
}
