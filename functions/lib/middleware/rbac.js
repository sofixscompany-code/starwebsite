"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.requireMinRole = requireMinRole;
exports.verifyDashboardAccess = verifyDashboardAccess;
const config_1 = require("../config");
function requireRole(...allowedRoles) {
    return (req, res, next) => {
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
function requireMinRole(minRole) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: "Not authenticated." });
            return;
        }
        const userLevel = config_1.ROLE_HIERARCHY[req.user.role] || 0;
        const requiredLevel = config_1.ROLE_HIERARCHY[minRole] || 0;
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
function verifyDashboardAccess(req, res, next) {
    var _a;
    if (!req.user) {
        res.status(401).json({ error: "Not authenticated." });
        return;
    }
    const requestedPath = req.path;
    const role = req.user.role;
    const allowedPath = config_1.ROLE_DASHBOARD_MAP[role];
    if (!allowedPath) {
        res.status(403).json({ error: "Invalid role. No dashboard assigned." });
        return;
    }
    if (requestedPath.startsWith("/dashboard/") && requestedPath !== allowedPath) {
        const userLevel = config_1.ROLE_HIERARCHY[role] || 0;
        const targetRole = (_a = Object.entries(config_1.ROLE_DASHBOARD_MAP).find(([, path]) => path === requestedPath)) === null || _a === void 0 ? void 0 : _a[0];
        const targetLevel = targetRole ? config_1.ROLE_HIERARCHY[targetRole] || 0 : 0;
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
//# sourceMappingURL=rbac.js.map