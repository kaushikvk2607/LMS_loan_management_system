import type { NextFunction, Request, Response } from "express";
import type { Role } from "../types/index.js";

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Authentication required." });
    if (req.user.role === "ADMIN" || allowedRoles.includes(req.user.role)) return next();

    return res.status(403).json({ message: "You do not have access to this resource." });
  };
}

export function requireBorrower(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: "Authentication required." });
  if (req.user.role === "BORROWER") return next();

  return res.status(403).json({ message: "Only borrowers can access this resource." });
}
