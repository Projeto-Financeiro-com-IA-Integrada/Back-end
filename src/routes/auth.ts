import { Router } from "express";
import { AuthController } from "../modules/user/controllers/AuthController";
import { validateBody } from "../middlewares/validateBody";
import {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
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