import { generateProjectInsights } from "../server/gemini";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo nao permitido." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY nao configurada no servidor." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const text = await generateProjectInsights(apiKey, body?.projectData);

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    return res.status(500).json({
      error: error?.message || "Erro ao gerar analise de IA.",
    });
  }
}
