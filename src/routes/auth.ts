import { Router } from "express";
import { AuthController } from "../modules/user/controllers/AuthController";
import { validateBody } from "../middlewares/validateBody";
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  resendCodeSchema,
  resetPasswordSchema,
  requestPasswordRecoverySchema,
} from "../modules/user/schemas/authSchemas";

export const authRouter = Router();

authRouter.post(
  "/register",
  validateBody(registerSchema),
  AuthController.register
);

authRouter.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  AuthController.verifyEmail
);

authRouter.post(
  "/login",
  validateBody(loginSchema),
  AuthController.login
);

authRouter.post(
  "/resend-code",
  validateBody(resendCodeSchema),
  AuthController.resendCode
);

authRouter.post(
  "/forgot-password",
  validateBody(requestPasswordRecoverySchema),
  (req, res) => AuthController.requestPasswordRecovery(req, res)
);

authRouter.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  (req, res) => AuthController.resetPassword(req, res)
);

