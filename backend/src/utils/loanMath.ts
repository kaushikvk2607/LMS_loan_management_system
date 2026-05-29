export const INTEREST_RATE = 12;

export function calculateLoan(amount: number, tenureDays: number) {
  const interestAmount = Number(((amount * INTEREST_RATE * tenureDays) / (365 * 100)).toFixed(2));
  const totalRepayment = Number((amount + interestAmount).toFixed(2));

  return {
    interestRate: INTEREST_RATE,
    interestAmount,
    totalRepayment
  };
}
