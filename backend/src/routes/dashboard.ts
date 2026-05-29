import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { Application } from "../models/Application.js";
import { Loan } from "../models/Loan.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";

export const dashboardRouter = Router();

const rejectSchema = z.object({ reason: z.string().min(3) });
const paymentSchema = z.object({
  utrNumber: z.string().min(3),
  amount: z.coerce.number().positive(),
  paidAt: z.coerce.date()
});

dashboardRouter.use(requireAuth);

dashboardRouter.get("/sales", requireRole("SALES"), async (_req, res) => {
  const borrowers = await User.find({ role: "BORROWER" }).select("-passwordHash").lean();
  const borrowerIds = borrowers.map((borrower) => borrower._id);
  const applications = await Application.find({ borrower: { $in: borrowerIds } }).lean();
  const loans = await Loan.find({ borrower: { $in: borrowerIds } }).lean();
  const appliedBorrowerIds = new Set(loans.map((loan) => String(loan.borrower)));

  const leads = borrowers
    .filter((borrower) => !appliedBorrowerIds.has(String(borrower._id)))
    .map((borrower) => ({
      borrower,
      application: applications.find((application) => String(application.borrower) === String(borrower._id)) ?? null
    }));

  return res.json({ leads });
});

dashboardRouter.get("/sanction", requireRole("SANCTION"), async (_req, res) => {
  const loans = await Loan.find({ status: "APPLIED" }).populate("borrower", "name email").populate("application").sort({ createdAt: -1 });
  return res.json({ loans });
});

dashboardRouter.patch("/sanction/:loanId/approve", requireRole("SANCTION"), async (req, res) => {
  const loan = await Loan.findOneAndUpdate(
    { _id: req.params.loanId, status: "APPLIED" },
    { status: "SANCTIONED", sanctionedAt: new Date(), rejectionReason: undefined },
    { new: true }
  );
  if (!loan) return res.status(404).json({ message: "Applied loan not found." });

  return res.json({ message: "Loan sanctioned.", loan });
});

dashboardRouter.patch("/sanction/:loanId/reject", requireRole("SANCTION"), async (req, res) => {
  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Rejection reason is required." });

  const loan = await Loan.findOneAndUpdate(
    { _id: req.params.loanId, status: "APPLIED" },
    { status: "REJECTED", rejectionReason: parsed.data.reason },
    { new: true }
  );
  if (!loan) return res.status(404).json({ message: "Applied loan not found." });

  return res.json({ message: "Loan rejected.", loan });
});

dashboardRouter.get("/disbursement", requireRole("DISBURSEMENT"), async (_req, res) => {
  const loans = await Loan.find({ status: "SANCTIONED" }).populate("borrower", "name email").populate("application").sort({ sanctionedAt: -1 });
  return res.json({ loans });
});

dashboardRouter.patch("/disbursement/:loanId/disburse", requireRole("DISBURSEMENT"), async (req, res) => {
  const loan = await Loan.findOneAndUpdate(
    { _id: req.params.loanId, status: "SANCTIONED" },
    { status: "DISBURSED", disbursedAt: new Date() },
    { new: true }
  );
  if (!loan) return res.status(404).json({ message: "Sanctioned loan not found." });

  return res.json({ message: "Loan disbursed.", loan });
});

dashboardRouter.get("/collection", requireRole("COLLECTION"), async (_req, res) => {
  const loans = await Loan.find({ status: { $in: ["DISBURSED", "CLOSED"] } })
    .populate("borrower", "name email")
    .populate("application")
    .sort({ disbursedAt: -1 });
  return res.json({ loans });
});

dashboardRouter.post("/collection/:loanId/payments", requireRole("COLLECTION"), async (req, res) => {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid payment data.", errors: parsed.error.flatten() });

  const loan = await Loan.findOne({ _id: req.params.loanId, status: "DISBURSED" });
  if (!loan) return res.status(404).json({ message: "Active disbursed loan not found." });

  const outstanding = Number((loan.totalRepayment - loan.amountPaid).toFixed(2));
  if (parsed.data.amount > outstanding) {
    return res.status(400).json({ message: `Payment cannot exceed outstanding balance of INR ${outstanding}.` });
  }

  try {
    const payment = await Payment.create({
      loan: loan.id,
      utrNumber: parsed.data.utrNumber.toUpperCase(),
      amount: parsed.data.amount,
      paidAt: parsed.data.paidAt,
      recordedBy: req.user?.id
    });

    loan.amountPaid = Number((loan.amountPaid + parsed.data.amount).toFixed(2));
    if (loan.amountPaid >= loan.totalRepayment) {
      loan.status = "CLOSED";
      loan.closedAt = new Date();
    }
    await loan.save();

    return res.status(201).json({ message: "Payment recorded.", payment, loan });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return res.status(409).json({ message: "UTR number already exists." });
    }
    throw error;
  }
});
