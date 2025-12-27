import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  name: z.string().min(2, "Nome muito curto"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula").regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula").regex(/[0-9]/, "Senha deve conter pelo menos um número"),
});

export const verifyEmailSchema = z.object({
  email: z.email(),
  code: z.string().length(6, "Código deve ter 6 dígitos"),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const resendCodeSchema = z.object({
  email: z.email(),
});

export const requestPasswordRecoverySchema = z.object({
  email: z.email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  email: z.email("Email inválido"),
  recoveryCode: z.string().length(6, "Código deve ter 6 dígitos"),
  newPassword: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[a-z]/, "Deve conter letra minúscula")
    .regex(/[A-Z]/, "Deve conter letra maiúscula")
    .regex(/\d/, "Deve conter número"),
});