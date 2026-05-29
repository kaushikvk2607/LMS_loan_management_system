import type { Types } from "mongoose";

export const roles = ["ADMIN", "SALES", "SANCTION", "DISBURSEMENT", "COLLECTION", "BORROWER"] as const;
export type Role = (typeof roles)[number];

export const loanStatuses = ["APPLIED", "SANCTIONED", "REJECTED", "DISBURSED", "CLOSED"] as const;
export type LoanStatus = (typeof loanStatuses)[number];

export type AuthUser = {
  id: string;
  role: Role;
  email: string;
};

export type MongoId = Types.ObjectId;
