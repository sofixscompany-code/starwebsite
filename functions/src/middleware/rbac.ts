import { Response, NextFunction } from "express";
import { AuthRequest } from "./verifyToken";
import { ROLE_DASHBOARD_MAP, ROLE_HIERARCHY } from "../config";

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "Access denied. You don't have permission to access this resource.",
        required: allowedRoles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}

export function requireMinRole(minRole: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < requiredLevel) {
      res.status(403).json({
        error: `Access denied. Requires ${minRole} or higher.`,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}

export function verifyDashboardAccess(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }

  const requestedPath = req.path;
  const role = req.user.role;
  const allowedPath = ROLE_DASHBOARD_MAP[role];

  if (!allowedPath) {
    res.status(403).json({ error: "Invalid role. No dashboard assigned." });
    return;
  }

  if (requestedPath.startsWith("/dashboard/") && requestedPath !== allowedPath) {
    const userLevel = ROLE_HIERARCHY[role] || 0;
    const targetRole = Object.entries(ROLE_DASHBOARD_MAP).find(([, path]) => path === requestedPath)?.[0];
    const targetLevel = targetRole ? ROLE_HIERARCHY[targetRole] || 0 : 0;

    if (userLevel < targetLevel) {
      res.status(403).json({
        error: `Access denied. Your role (${role}) cannot access ${requestedPath}.`,
        allowed: allowedPath,
      });
      return;
    }
  }

  next();
}
