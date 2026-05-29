import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { requireAuth, signToken } from "../middleware/auth.js";
import { User } from "../models/User.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid registration data.", errors: parsed.error.flatten() });

  const existing = await User.findOne({ email: parsed.data.email });
  if (existing) return res.status(409).json({ message: "Email is already registered." });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await User.create({ ...parsed.data, passwordHash, role: "BORROWER" });
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid login data." });

  const user = await User.findOne({ email: parsed.data.email });
  if (!user || !(await user.comparePassword(parsed.data.password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user?.id).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found." });

  return res.json({ user });
});
