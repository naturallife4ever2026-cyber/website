import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "../prisma.js";
import { analyzeComplaint } from "../services/gemini.js";

const router = Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) return cb(new Error("Only JPG, PNG and WebP images are allowed."));
    cb(null, true);
  }
});

router.get("/", async (req, res) => {
  const { q = "", status, priority, category } = req.query;
  const where = {
    ...(status && status !== "ALL" ? { status: String(status) } : {}),
    ...(priority && priority !== "ALL" ? { priority: String(priority) } : {}),
    ...(category && category !== "ALL" ? { category: String(category) } : {}),
    ...(q ? { OR: [
      { title: { contains: String(q) } }, { reference: { contains: String(q) } },
      { location: { contains: String(q) } }, { ward: { contains: String(q) } }
    ] } : {})
  };
  const complaints = await prisma.complaint.findMany({
    where, orderBy: [{ priority: "asc" }, { createdAt: "desc" }], include: { department: true }
  });
  res.json(complaints);
});

router.get("/:id", async (req, res) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: req.params.id }, include: { department: true, history: { orderBy: { createdAt: "desc" } } }
  });
  if (!complaint) return res.status(404).json({ message: "Complaint not found." });
  res.json(complaint);
});

router.patch("/:id", async (req, res) => {
  const allowedStatus = ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REJECTED"];
  const allowedPriority = ["HIGH", "MEDIUM", "LOW"];
  const { status, priority, departmentId, note } = req.body;
  const current = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ message: "Complaint not found." });
  if (status && !allowedStatus.includes(status)) return res.status(400).json({ message: "Invalid status." });
  if (priority && !allowedPriority.includes(priority)) return res.status(400).json({ message: "Invalid priority." });
  if (departmentId && !(await prisma.department.findUnique({ where: { id: departmentId } }))) {
    return res.status(400).json({ message: "Department not found." });
  }

  const updated = await prisma.complaint.update({
    where: { id: req.params.id },
    data: {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(departmentId ? { departmentId } : {})
    },
    include: { department: true }
  });
  if (status && status !== current.status) {
    await prisma.statusHistory.create({ data: { complaintId: current.id, status, note: note || "Updated by administrator" } });
  }
  res.json(updated);
});

router.post("/:id/analyze", upload.single("image"), async (req, res) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!complaint) return res.status(404).json({ message: "Complaint not found." });
  try {
    const result = await analyzeComplaint({
      title: complaint.title,
      description: complaint.description,
      imagePath: req.file?.path,
      mimeType: req.file?.mimetype
    });
    const department = await prisma.department.findFirst({ where: { name: result.recommendedDepartment } });
    const updated = await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        aiCategory: result.category,
        aiSummary: result.summary,
        aiConfidence: result.confidence,
        aiSource: result.source,
        aiVerifiedAt: new Date()
      }
    });
    res.json({ result, complaint: updated, recommendedDepartmentId: department?.id || null });
  } catch (error) {
    res.status(502).json({ message: error.message || "AI analysis failed." });
  }
});

export default router;
