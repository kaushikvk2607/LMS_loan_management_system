import mongoose, { Schema } from "mongoose";

export type PaymentDocument = mongoose.Document & {
  loan: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  paidAt: Date;
  recordedBy: mongoose.Types.ObjectId;
};

const paymentSchema = new Schema<PaymentDocument>(
  {
    loan: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
    utrNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paidAt: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const Payment = mongoose.model<PaymentDocument>("Payment", paymentSchema);
