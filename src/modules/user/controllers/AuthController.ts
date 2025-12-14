import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/UserRepository";


export class AuthController {
  static async register(req: Request, res: Response) {
    try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    const userRepo = userRepository();

    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "E-mail já cadastrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    const user = userRepo.create({
      email,
      name,
      passwordHash,
      isVerified: false,
      verificationCode,
      verificationExpiresAt,
    });

    await userRepo.save(user);

    // TODO: enviar e-mail com verificationCode

    return res.status(201).json({ message: "Usuário criado. Verifique seu e-mail." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno" });
  }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
    const { email, code } = req.body;
    const userRepo = userRepository();

    const user = await userRepo.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    if (user.isVerified) {
      return res.status(400).json({ message: "E-mail já verificado" });
    }

    if (
      user.verificationCode !== code ||
      !user.verificationExpiresAt ||
      user.verificationExpiresAt < new Date()
    ) {
      return res.status(400).json({ message: "Código inválido ou expirado" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpiresAt = null;

    await userRepo.save(user);

    return res.json({ message: "E-mail verificado com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno" });
  }
  }

  static async login(req: Request, res: Response) {
    try {
    const { email, password } = req.body;
    const userRepo = userRepository();

    const user = await userRepo.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Credenciais inválidas" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });

    if (!user.isVerified) {
      return res.status(403).json({ message: "E-mail não verificado" });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    return res.json({ accessToken: token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno" });
  }
  }
}