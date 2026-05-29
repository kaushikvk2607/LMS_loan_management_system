import bcrypt from "bcryptjs";
import { connectDb } from "../config/db.js";
import { User } from "../models/User.js";
import type { Role } from "../types/index.js";

const password = "Password@123";
const accounts: Array<{ name: string; email: string; role: Role }> = [
  { name: "Admin User", email: "admin@lms.dev", role: "ADMIN" },
  { name: "Sales Executive", email: "sales@lms.dev", role: "SALES" },
  { name: "Sanction Executive", email: "sanction@lms.dev", role: "SANCTION" },
  { name: "Disbursement Executive", email: "disbursement@lms.dev", role: "DISBURSEMENT" },
  { name: "Collection Executive", email: "collection@lms.dev", role: "COLLECTION" },
  { name: "Borrower User", email: "borrower@lms.dev", role: "BORROWER" }
];

await connectDb();

const passwordHash = await bcrypt.hash(password, 12);
for (const account of accounts) {
  await User.findOneAndUpdate(
    { email: account.email },
    { ...account, passwordHash },
    { upsert: true, new: true, runValidators: true }
  );
}

console.table(accounts.map((account) => ({ ...account, password })));
process.exit(0);
