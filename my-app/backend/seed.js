import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const departments = [
  "Sanitation Department", "Drainage Department", "Water Supply Department",
  "Roads & Public Works", "Electricity Department", "Waste Management Department",
  "General Administration"
];

const samples = [
  ["Open Drain / Sewage Overflow", "Drainage water is overflowing into the lane and waste is collecting near homes.", "Drainage", "Buddha Colony Slum, Patna", "Ward 12", "HIGH", "IN_PROGRESS", "Ravi Kumar"],
  ["Garbage Not Collected", "Garbage has not been collected for several days near the community entrance.", "Waste Management", "Rajendra Nagar, Patna", "Ward 10", "MEDIUM", "SUBMITTED", "Sunita Devi"],
  ["Broken Road Surface", "A large pothole is creating difficulty for pedestrians and two-wheelers.", "Roads", "Kankarbagh, Patna", "Ward 35", "HIGH", "UNDER_REVIEW", "Amit Kumar"],
  ["Public Tap Water Leakage", "Water is continuously leaking from a public pipeline.", "Water Supply", "Lodipur, Patna", "Ward 22", "MEDIUM", "RESOLVED", "Pooja Kumari"],
  ["Street Light Not Working", "Street light near the community road has stopped working.", "Electricity", "Digha, Patna", "Ward 1", "LOW", "SUBMITTED", "Manoj Paswan"],
  ["Blocked Community Drain", "The drain is blocked and rainwater is accumulating on the street.", "Drainage", "Phulwari Sharif, Patna", "Ward 5", "HIGH", "SUBMITTED", "Neha Kumari"]
];

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);
  await prisma.user.upsert({
    where: { email: "admin@slumpulse.ai" },
    update: {},
    create: { name: "Government Administrator", email: "admin@slumpulse.ai", passwordHash, role: "ADMIN" }
  });
  for (const name of departments) await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
  for (let i = 0; i < samples.length; i++) {
    const [title, description, category, location, ward, priority, status, citizenName] = samples[i];
    const reference = `ISP${1256 + i}`;
    const departmentName = category === "Drainage" ? "Drainage Department" :
      category === "Roads" ? "Roads & Public Works" :
      category === "Water Supply" ? "Water Supply Department" :
      category === "Electricity" ? "Electricity Department" :
      category === "Waste Management" ? "Waste Management Department" : "General Administration";
    const department = await prisma.department.findUnique({ where: { name: departmentName } });
    const complaint = await prisma.complaint.upsert({
      where: { reference }, update: {},
      create: { reference, title, description, category, location, ward, priority, status, citizenName, departmentId: department.id }
    });
    const historyCount = await prisma.statusHistory.count({ where: { complaintId: complaint.id } });
    if (!historyCount) await prisma.statusHistory.create({ data: { complaintId: complaint.id, status, note: "Complaint registered in demo dataset" } });
  }
  console.log("Seed complete. Admin: admin@slumpulse.ai / Admin@123");
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
