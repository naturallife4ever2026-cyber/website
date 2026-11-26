import { Router } from "express";
import { prisma } from "../prisma.js";
const router = Router();
router.get("/", async (_req, res) => res.json(await prisma.department.findMany({ orderBy: { name: "asc" } })));
export default router;
