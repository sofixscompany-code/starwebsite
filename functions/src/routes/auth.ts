import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as admin from "firebase-admin";
import { JWT_SECRET, JWT_EXPIRES_IN, DEMO_JWT_EXPIRES_IN, DEMO_USERS, ROLE_DASHBOARD_MAP } from "../config";
import { verifyToken, AuthRequest } from "../middleware/verifyToken";
import { verifyDashboardAccess } from "../middleware/rbac";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
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

    const userData = userDoc.data()!;
    const role = userData.role;
    const name = userData.full_name || userRecord.displayName || email.split("@")[0];

    if (!role || !ROLE_DASHBOARD_MAP[role]) {
      res.status(403).json({ error: "No valid role assigned. Contact administrator." });
      return;
    }

    const token = jwt.sign(
      { uid: userRecord.uid, email, role, name, isDemo: false },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        uid: userRecord.uid,
        email,
        role,
        name,
        dashboard: ROLE_DASHBOARD_MAP[role],
      },
    });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

router.post("/demo-login", async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    if (!role || !DEMO_USERS[role]) {
      res.status(400).json({ error: "Invalid demo role." });
      return;
    }

    const demoUser = DEMO_USERS[role];

    const token = jwt.sign(
      {
        uid: `demo-${role}-${Date.now()}`,
        email: demoUser.email,
        role: demoUser.role,
        name: demoUser.name,
        isDemo: true,
      },
      JWT_SECRET,
      { expiresIn: DEMO_JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        uid: `demo-${role}`,
        email: demoUser.email,
        role: demoUser.role,
        name: demoUser.name,
        dashboard: ROLE_DASHBOARD_MAP[role],
        isDemo: true,
      },
    });
  } catch (err) {
    console.error("[Auth] Demo login error:", err);
    res.status(500).json({ error: "Demo login failed." });
  }
});

router.get("/verify", verifyToken, (req: AuthRequest, res: Response) => {
  res.json({
    valid: true,
    user: req.user,
    dashboard: ROLE_DASHBOARD_MAP[req.user!.role],
  });
});

router.get("/dashboard-access", verifyToken, verifyDashboardAccess, (req: AuthRequest, res: Response) => {
  res.json({
    allowed: true,
    role: req.user!.role,
    dashboard: ROLE_DASHBOARD_MAP[req.user!.role],
  });
});

router.get("/me", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.isDemo) {
      res.json({
        user: {
          uid: req.user!.uid,
          email: req.user!.email,
          role: req.user!.role,
          name: req.user!.name,
          isDemo: true,
        },
      });
      return;
    }

    const userDoc = await admin.firestore().collection("users").doc(req.user!.uid).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const data = userDoc.data()!;
    res.json({
      user: {
        uid: req.user!.uid,
        email: req.user!.email,
        role: data.role,
        name: data.full_name,
        phone: data.phone,
        branch: data.branch,
        status: data.status,
        photoURL: data.photoURL,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
});

export default router;
