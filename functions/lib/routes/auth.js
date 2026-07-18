"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const admin = __importStar(require("firebase-admin"));
const config_1 = require("../config");
const verifyToken_1 = require("../middleware/verifyToken");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required." });
            return;
        }
        const userRecord = await admin.auth().getUserByEmail(email).catch(() => null);
        if (!userRecord) {
            res.status(401).json({ error: "Invalid email or password." });
            return;
        }
        const userDoc = await admin.firestore().collection("users").doc(userRecord.uid).get();
        if (!userDoc.exists) {
            res.status(401).json({ error: "User profile not found. Contact administrator." });
            return;
        }
        const userData = userDoc.data();
        const role = userData.role;
        const name = userData.full_name || userRecord.displayName || email.split("@")[0];
        if (!role || !config_1.ROLE_DASHBOARD_MAP[role]) {
            res.status(403).json({ error: "No valid role assigned. Contact administrator." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ uid: userRecord.uid, email, role, name, isDemo: false }, config_1.JWT_SECRET, { expiresIn: config_1.JWT_EXPIRES_IN });
        res.json({
            token,
            user: {
                uid: userRecord.uid,
                email,
                role,
                name,
                dashboard: config_1.ROLE_DASHBOARD_MAP[role],
            },
        });
    }
    catch (err) {
        console.error("[Auth] Login error:", err);
        res.status(500).json({ error: "Login failed. Please try again." });
    }
});
router.post("/demo-login", async (req, res) => {
    try {
        const { role } = req.body;
        if (!role || !config_1.DEMO_USERS[role]) {
            res.status(400).json({ error: "Invalid demo role." });
            return;
        }
        const demoUser = config_1.DEMO_USERS[role];
        const token = jsonwebtoken_1.default.sign({
            uid: `demo-${role}-${Date.now()}`,
            email: demoUser.email,
            role: demoUser.role,
            name: demoUser.name,
            isDemo: true,
        }, config_1.JWT_SECRET, { expiresIn: config_1.DEMO_JWT_EXPIRES_IN });
        res.json({
            token,
            user: {
                uid: `demo-${role}`,
                email: demoUser.email,
                role: demoUser.role,
                name: demoUser.name,
                dashboard: config_1.ROLE_DASHBOARD_MAP[role],
                isDemo: true,
            },
        });
    }
    catch (err) {
        console.error("[Auth] Demo login error:", err);
        res.status(500).json({ error: "Demo login failed." });
    }
});
router.get("/verify", verifyToken_1.verifyToken, (req, res) => {
    res.json({
        valid: true,
        user: req.user,
        dashboard: config_1.ROLE_DASHBOARD_MAP[req.user.role],
    });
});
router.get("/dashboard-access", verifyToken_1.verifyToken, rbac_1.verifyDashboardAccess, (req, res) => {
    res.json({
        allowed: true,
        role: req.user.role,
        dashboard: config_1.ROLE_DASHBOARD_MAP[req.user.role],
    });
});
router.get("/me", verifyToken_1.verifyToken, async (req, res) => {
    try {
        if (req.user.isDemo) {
            res.json({
                user: {
                    uid: req.user.uid,
                    email: req.user.email,
                    role: req.user.role,
                    name: req.user.name,
                    isDemo: true,
                },
            });
            return;
        }
        const userDoc = await admin.firestore().collection("users").doc(req.user.uid).get();
        if (!userDoc.exists) {
            res.status(404).json({ error: "User not found." });
            return;
        }
        const data = userDoc.data();
        res.json({
            user: {
                uid: req.user.uid,
                email: req.user.email,
                role: data.role,
                name: data.full_name,
                phone: data.phone,
                branch: data.branch,
                status: data.status,
                photoURL: data.photoURL,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch user profile." });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map