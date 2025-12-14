import { Router } from "express";
import { AuthController } from "../modules/user/controllers/AuthController";

export const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/verify-email", AuthController.verifyEmail);
authRouter.post("/login", AuthController.login);