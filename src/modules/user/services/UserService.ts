import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/UserRepository";

interface RegisterDTO {
  email: string;
  name: string;
  password: string;
}

interface VerifyEmailDTO {
  email: string;
  code: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export class UserService {
  async register({ email, name, password }: RegisterDTO) {
    const repo = userRepository();

    const existing = await repo.findOne({ where: { email } });
    if (existing) {
      return {
        status: 409,
        body: { message: "E-mail já cadastrado" },
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const user = repo.create({
      email,
      name,
      passwordHash,
      isVerified: false,
      verificationCode,
      verificationExpiresAt,
    });

    await repo.save(user);

    // TODO: enviar e-mail com verificationCode

    return {
      status: 201,
      body: { message: "Usuário criado. Verifique seu e-mail." },
    };
  }

  async verifyEmail({ email, code }: VerifyEmailDTO) {
    const repo = userRepository();
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      return {
        status: 404,
        body: { message: "Usuário não encontrado" },
      };
    }

    if (user.isVerified) {
      return {
        status: 400,
        body: { message: "E-mail já verificado" },
      };
    }

    if (
      user.verificationCode !== code ||
      !user.verificationExpiresAt ||
      user.verificationExpiresAt < new Date()
    ) {
      return {
        status: 400,
        body: { message: "Código inválido ou expirado" },
      };
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpiresAt = null;

    await repo.save(user);

    return {
      status: 200,
      body: { message: "E-mail verificado com sucesso" },
    };
  }

  async login({ email, password }: LoginDTO) {
    const repo = userRepository();
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      return {
        status: 401,
        body: { message: "Credenciais inválidas" },
      };
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return {
        status: 401,
        body: { message: "Credenciais inválidas" },
      };
    }

    if (!user.isVerified) {
      return {
        status: 403,
        body: { message: "E-mail não verificado" },
      };
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET não definido");
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      secret,
      { expiresIn: "15m" }
    );

    return {
      status: 200,
      body: { accessToken: token },
    };
  }
}
