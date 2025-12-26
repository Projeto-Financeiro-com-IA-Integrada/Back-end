import { z } from "zod";

export const createTransactionSchema = z.object({
  // Aceita valor em reais, mas será convertido para centavos
  amount: z.number()
    .positive("Valor deve ser positivo")
    .refine(
      (val) => Number.isFinite(val) && val <= 999999999.99,
      "Valor muito grande"
    ),
  description: z.string().min(3, "Descrição muito curta").max(255),
  date: z.string().datetime().or(z.date()),
  categoryId: z.string().uuid("ID de categoria inválido"),
  notes: z.string().max(500).optional(),
  status: z.enum(["pending", "completed", "cancelled"]).optional()
});

export const updateTransactionSchema = createTransactionSchema.partial();
