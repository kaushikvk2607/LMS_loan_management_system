import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { borrowerRouter } from "./routes/borrower.js";
import { dashboardRouter } from "./routes/dashboard.js";

export const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(env.uploadDir));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/borrower", borrowerRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ message: "Unexpected server error." });
});
