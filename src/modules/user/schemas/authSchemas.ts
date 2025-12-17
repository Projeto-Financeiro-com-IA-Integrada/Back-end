import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  name: z.string().min(2, "Nome muito curto"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
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
  email: z.string().email(),
});
