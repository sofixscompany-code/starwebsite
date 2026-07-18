import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";

admin.initializeApp();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export const api = functions.https.onRequest(app);
