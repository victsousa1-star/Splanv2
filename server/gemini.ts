import { GoogleGenAI } from "@google/genai";

function formatCurrency(value: number | undefined) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function buildPrompt(projectData: any) {
  const stats = projectData?.stats || {};
  const simulation = projectData?.overallSimulation || {};
  const totalValue = Number(stats.totalValue || 0);
  const totalMeasured = Number(stats.totalMeasured || 0);
  const measuredPercent = totalValue > 0 ? (totalMeasured / totalValue) * 100 : 0;

  return `
Voce e um especialista em gestao de obras e engenharia civil.
Analise os seguintes dados do projeto "${projectData?.name || "Projeto"}" e forneca insights estrategicos,
alertas de riscos e oportunidades de otimizacao.

Dados do Projeto:
- Valor Total Contratado: ${formatCurrency(totalValue)}
- Total Medido (Execucao Fisica): ${formatCurrency(totalMeasured)} (${measuredPercent.toFixed(1)}%)
- Total em Notas Fiscais (Faturamento): ${formatCurrency(stats.totalInvoices)}
- Total Desembolsado: ${formatCurrency(stats.totalDisbursements)}

Status do Cronograma: ${simulation.isLate ? "Atrasada" : "No Prazo/Adiantada"}
Avanco Global Real: ${simulation.real || 0}%
Planejado na Data: ${simulation.expected || 0}%
Desvio: ${simulation.diff || 0}%

Forneca uma analise concisa em 3 paragrafos:
1. Saude financeira: fluxo de caixa, medicao vs notas vs desembolso.
2. Performance do cronograma: causa provavel do desvio e impacto.
3. Recomendacoes de proximos passos.
`;
}

export async function generateProjectInsights(apiKey: string, projectData: any) {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: buildPrompt(projectData),
  });

  return response.text;
}
