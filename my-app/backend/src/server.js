import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import complaintRoutes from "./routes/complaints.js";
import departmentRoutes from "./routes/departments.js";
import { requireAuth } from "./middleware/auth.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), authRoutes);
app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "SlumPulse AI API" }));
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/complaints", requireAuth, complaintRoutes);
app.use("/api/departments", requireAuth, departmentRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ message: err.message || "Something went wrong." });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`SlumPulse API running at http://localhost:${port}`));
