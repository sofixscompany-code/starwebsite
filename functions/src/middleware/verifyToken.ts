import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export interface AuthPayload {
  uid: string;
  email: string;
  role: string;
  name: string;
  isDemo?: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided. Authorization denied." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired. Please login again." });
    } else {
      res.status(401).json({ error: "Invalid token. Authorization denied." });
    }
  }
}
