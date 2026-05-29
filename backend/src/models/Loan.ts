import mongoose, { Schema } from "mongoose";
import { loanStatuses, type LoanStatus } from "../types/index.js";

export type LoanDocument = mongoose.Document & {
  borrower: mongoose.Types.ObjectId;
  application: mongoose.Types.ObjectId;
  amount: number;
  tenureDays: number;
  interestRate: number;
  interestAmount: number;
  totalRepayment: number;
  amountPaid: number;
  status: LoanStatus;
  rejectionReason?: string;
  sanctionedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
};

const loanSchema = new Schema<LoanDocument>(
  {
    borrower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    application: { type: Schema.Types.ObjectId, ref: "Application", required: true },
    amount: { type: Number, required: true, min: 50000, max: 500000 },
    tenureDays: { type: Number, required: true, min: 30, max: 365 },
    interestRate: { type: Number, default: 12, required: true },
    interestAmount: { type: Number, required: true, min: 0 },
    totalRepayment: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, required: true, min: 0 },
    status: { type: String, enum: loanStatuses, default: "APPLIED", required: true },
    rejectionReason: { type: String, trim: true },
    sanctionedAt: Date,
    disbursedAt: Date,
    closedAt: Date
  },
  { timestamps: true }
);

loanSchema.index({ borrower: 1, status: 1 });

export const Loan = mongoose.model<LoanDocument>("Loan", loanSchema);
