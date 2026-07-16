export async function analyzeProjectInsights(projectData: any) {
  const response = await fetch("/api/analyze-project-insights", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectData }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Nao foi possivel gerar a analise de IA.");
  }

  const payload = await response.json();
  return payload.text as string;
}
