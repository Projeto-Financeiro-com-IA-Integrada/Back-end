import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Para alterar a senha, forneça a senha atual",
      path: ["currentPassword"],
    }
  );

export const requestEmailChangeSchema = z.object({
  newEmail: z.string().email("Email inválido"),
});

export const confirmEmailChangeSchema = z.object({
  newEmail: z.string().email("Email inválido"),
  verificationCode: z.string().length(6, "Código deve ter 6 dígitos"),
});

// Estratégia 2: senha apenas no request, código apenas na confirmação

export const requestAccountDeletionSchema = z.object({
  password: z.string().min(1, "Senha é obrigatória"),
});

export const confirmAccountDeletionSchema = z.object({
  verificationCode: z.string().length(6, "Código deve ter 6 dígitos"),
});
