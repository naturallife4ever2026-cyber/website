import { Router } from "express";
import { prisma } from "../prisma.js";
const router = Router();

router.get("/summary", async (_req, res) => {
  const [total, pending, inProgress, resolved, highPriority, departments, recent] = await Promise.all([
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.complaint.count({ where: { status: "IN_PROGRESS" } }),
    prisma.complaint.count({ where: { status: "RESOLVED" } }),
    prisma.complaint.count({ where: { priority: "HIGH", status: { not: "RESOLVED" } } }),
    prisma.department.findMany({ include: { _count: { select: { complaints: true } } } }),
    prisma.complaint.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { department: true } })
  ]);
  res.json({
    total, pending, inProgress, resolved, highPriority,
    resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
    departments: departments.map(d => ({ name: d.name, count: d._count.complaints })),
    recent
  });
});
export default router;
