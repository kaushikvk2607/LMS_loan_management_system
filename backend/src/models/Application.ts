import mongoose, { Schema } from "mongoose";

export type ApplicationDocument = mongoose.Document & {
  borrower: mongoose.Types.ObjectId;
  fullName: string;
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: "SALARIED" | "SELF_EMPLOYED" | "UNEMPLOYED";
  eligibilityStatus: "PENDING" | "PASSED" | "FAILED";
  eligibilityErrors: string[];
  salarySlip?: {
    fileName: string;
    path: string;
    mimeType: string;
    size: number;
  };
};

const applicationSchema = new Schema<ApplicationDocument>(
  {
    borrower: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    pan: { type: String, required: true, uppercase: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    monthlySalary: { type: Number, required: true, min: 0 },
    employmentMode: {
      type: String,
      enum: ["SALARIED", "SELF_EMPLOYED", "UNEMPLOYED"],
      required: true
    },
    eligibilityStatus: {
      type: String,
      enum: ["PENDING", "PASSED", "FAILED"],
      default: "PENDING",
      required: true
    },
    eligibilityErrors: [{ type: String }],
    salarySlip: {
      fileName: String,
      path: String,
      mimeType: String,
      size: Number
    }
  },
  { timestamps: true }
);

export const Application = mongoose.model<ApplicationDocument>("Application", applicationSchema);
