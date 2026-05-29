import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";
import { requireBorrower } from "../middleware/roles.js";
import { Application } from "../models/Application.js";
import { Loan } from "../models/Loan.js";
import { Payment } from "../models/Payment.js";
import { calculateLoan } from "../utils/loanMath.js";
import { runEligibilityRules } from "../utils/bre.js";

export const borrowerRouter = Router();

const uploadPath = path.resolve(env.uploadDir);
fs.mkdirSync(uploadPath, { recursive: true });

const upload = multer({
  dest: uploadPath,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    cb(null, allowed.includes(file.mimetype));
  }
});

const detailsSchema = z.object({
  fullName: z.string().min(2),
  pan: z.string().min(10).max(10),
  dateOfBirth: z.coerce.date(),
  monthlySalary: z.coerce.number().min(0),
  employmentMode: z.enum(["SALARIED", "SELF_EMPLOYED", "UNEMPLOYED"])
});

const loanSchema = z.object({
  amount: z.coerce.number().min(50000).max(500000),
  tenureDays: z.coerce.number().int().min(30).max(365)
});

borrowerRouter.use(requireAuth, requireBorrower);

borrowerRouter.get("/me", async (req, res) => {
  const application = await Application.findOne({ borrower: req.user?.id });
  const loan = await Loan.findOne({ borrower: req.user?.id }).sort({ createdAt: -1 });
  const payments = loan ? await Payment.find({ loan: loan.id }).sort({ paidAt: -1 }) : [];

  return res.json({ application, loan, payments });
});

borrowerRouter.post("/details", async (req, res) => {
  const parsed = detailsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid personal details.", errors: parsed.error.flatten() });

  const data = { ...parsed.data, pan: parsed.data.pan.toUpperCase() };
  const result = runEligibilityRules(data);

  const application = await Application.findOneAndUpdate(
    { borrower: req.user?.id },
    {
      ...data,
      borrower: req.user?.id,
      eligibilityStatus: result.passed ? "PASSED" : "FAILED",
      eligibilityErrors: result.errors
    },
    { new: true, upsert: true, runValidators: true }
  );

  if (!result.passed) {
    return res.status(422).json({ message: "Eligibility check failed.", errors: result.errors, application });
  }

  return res.json({ message: "Eligibility check passed.", application });
});

borrowerRouter.post("/salary-slip", upload.single("salarySlip"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Upload a PDF, JPG, or PNG salary slip under 5 MB." });

  const application = await Application.findOne({ borrower: req.user?.id });
  if (!application || application.eligibilityStatus !== "PASSED") {
    return res.status(400).json({ message: "Complete eligible personal details before uploading a salary slip." });
  }

  application.salarySlip = {
    fileName: req.file.originalname,
    path: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size
  };
  await application.save();

  return res.json({ message: "Salary slip uploaded.", application });
});

borrowerRouter.post("/apply", async (req, res) => {
  const parsed = loanSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid loan configuration.", errors: parsed.error.flatten() });

  const application = await Application.findOne({ borrower: req.user?.id });
  if (!application || application.eligibilityStatus !== "PASSED" || !application.salarySlip) {
    return res.status(400).json({ message: "Complete eligibility and salary slip upload before applying." });
  }

  const activeLoan = await Loan.findOne({
    borrower: req.user?.id,
    status: { $in: ["APPLIED", "SANCTIONED", "DISBURSED"] }
  });
  if (activeLoan) return res.status(409).json({ message: "An active loan already exists." });

  const totals = calculateLoan(parsed.data.amount, parsed.data.tenureDays);
  const loan = await Loan.create({
    borrower: req.user?.id,
    application: application.id,
    amount: parsed.data.amount,
    tenureDays: parsed.data.tenureDays,
    ...totals,
    status: "APPLIED"
  });

  return res.status(201).json({ message: "Loan application submitted.", loan });
});
