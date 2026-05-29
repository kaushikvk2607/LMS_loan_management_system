export type Role = "ADMIN" | "SALES" | "SANCTION" | "DISBURSEMENT" | "COLLECTION" | "BORROWER";
export type LoanStatus = "APPLIED" | "SANCTIONED" | "REJECTED" | "DISBURSED" | "CLOSED";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Application = {
  _id: string;
  fullName: string;
  pan: string;
  dateOfBirth: string;
  monthlySalary: number;
  employmentMode: string;
  eligibilityStatus: "PENDING" | "PASSED" | "FAILED";
  eligibilityErrors: string[];
  salarySlip?: { fileName: string };
};

export type Loan = {
  _id: string;
  borrower: AuthUser | string;
  application: Application | string;
  amount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  amountPaid: number;
  status: LoanStatus;
  rejectionReason?: string;
};

export type Payment = {
  _id: string;
  utrNumber: string;
  amount: number;
  paidAt: string;
};
