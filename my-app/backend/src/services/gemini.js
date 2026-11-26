import { GoogleGenAI } from "@google/genai";

const categories = ["Sanitation", "Roads", "Water Supply", "Electricity", "Waste Management", "Drainage", "Other"];
const departments = {
  Sanitation: "Sanitation Department",
  Roads: "Roads & Public Works",
  "Water Supply": "Water Supply Department",
  Electricity: "Electricity Department",
  "Waste Management": "Waste Management Department",
  Drainage: "Drainage Department",
  Other: "General Administration"
};

export async function analyzeComplaint({ title, description, imagePath, mimeType }) {
  if (!process.env.GEMINI_API_KEY) {
    const text = `${title} ${description}`.toLowerCase();
    const category = /drain|sewage|waterlog/.test(text) ? "Drainage" :
      /garbage|waste|trash/.test(text) ? "Waste Management" :
      /road|pothole/.test(text) ? "Roads" :
      /water|pipe|leak/.test(text) ? "Water Supply" : "Other";
    return {
      source: "DEMO",
      category,
      priority: /overflow|open drain|sewage|danger|broken/.test(text) ? "HIGH" : "MEDIUM",
      confidence: 0.62,
      summary: "Demo analysis based on complaint text only. Add a Gemini API key to enable real image and text analysis.",
      recommendedDepartment: departments[category],
      risk: "Requires staff verification",
      duplicateHint: "Not checked by AI in demo mode."
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are an assistant for a civic complaint management system in Patna, Bihar, India.
Analyze the citizen complaint. Return ONLY valid JSON with these keys:
category (one of ${categories.join(", ")}), priority (HIGH, MEDIUM, LOW),
confidence (number 0 to 1), summary (short factual summary),
recommendedDepartment (department name), risk (short public safety consideration),
duplicateHint (say whether description alone suggests a possible duplicate; do not claim database matching).
Do not infer exact GPS location or facts not visible/provided. Be cautious. A human administrator makes the final decision.
Complaint title: ${title}
Description: ${description}`;

  const parts = [{ text: prompt }];
  if (imagePath) {
    const fs = await import("node:fs/promises");
    const bytes = await fs.readFile(imagePath);
    parts.push({ inlineData: { mimeType: mimeType || "image/jpeg", data: bytes.toString("base64") } });
  }

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: [{ role: "user", parts }],
    config: { responseMimeType: "application/json" }
  });

  let result;
  try { result = JSON.parse(response.text); }
  catch { throw new Error("Gemini returned an unreadable response. Please retry."); }

  const safeCategory = categories.includes(result.category) ? result.category : "Other";
  const safePriority = ["HIGH", "MEDIUM", "LOW"].includes(result.priority) ? result.priority : "MEDIUM";
  return {
    source: "GEMINI",
    category: safeCategory,
    priority: safePriority,
    confidence: Math.max(0, Math.min(1, Number(result.confidence) || 0)),
    summary: String(result.summary || "No summary provided").slice(0, 600),
    recommendedDepartment: departments[safeCategory],
    risk: String(result.risk || "Manual review recommended").slice(0, 300),
    duplicateHint: String(result.duplicateHint || "Manual duplicate check recommended").slice(0, 300)
  };
}
