import { z } from "zod";

// Schema para requisição de chat
export const chatRequestSchema = z.object({
  question: z
    .string()
    .min(5, "Pergunta deve ter pelo menos 5 caracteres")
    .max(500, "Pergunta não pode exceder 500 caracteres"),
});

// Schema para geração de relatório mensal
export const generateMonthlyReportSchema = z.object({
  month: z
    .number()
    .min(1, "Mês deve ser entre 1 e 12")
    .max(12, "Mês deve ser entre 1 e 12"),
  year: z
    .number()
    .min(2020, "Ano deve ser a partir de 2020")
    .max(new Date().getFullYear() + 1, "Ano não pode ser no futuro"),
});

// Schema para gerar insights sobre metas
export const getGoalsInsightSchema = z.object({
  goalId: z.string().uuid("ID de meta inválido"),
});

// Schema para análise de gastos por categoria
export const analyzeCategorySchema = z.object({
  categoryId: z.string().uuid("ID de categoria inválido"),
  month: z
    .number()
    .min(1)
    .max(12),
  year: z.number().min(2020),
});
