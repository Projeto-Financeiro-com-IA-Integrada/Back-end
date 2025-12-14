import { Request, Response } from "express";
import { UserService } from "../services/UserService";

const userService = new UserService();

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body;

      const result = await userService.register({ email, name, password });

      return res.status(result.status).json(result.body);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro interno" });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      const result = await userService.verifyEmail({ email, code });

      return res.status(result.status).json(result.body);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro interno" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await userService.login({ email, password });

      return res.status(result.status).json(result.body);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro interno" });
    }
  }
}
