import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/UserRepository";
import { sendPasswordRecoveryEmail, sendVerificationEmail } from "../../../shared/providers/MailProvider";
import { RedisRateLimiter } from "../../../shared/utils/redisRateLimiter";

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

interface ResendCodeDTO {
  email: string;
}

interface RequestPasswordRecoveryDTO {
  email: string;
}

interface ResetPasswordDTO {
  email: string;
  recoveryCode: string;
  newPassword: string;
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

    const emailSent = await sendVerificationEmail(email, name, verificationCode);

    if (!emailSent) {
      return {
        status: 500,
        body: { message: "Usuário criado, mas falha ao enviar e-mail. Tente reenviar." },
      };
    }

    return {
      status: 201,
      body: { message: "Usuário criado. Verifique seu e-mail." },
    };
  }

    async verifyEmail({ email, code }: VerifyEmailDTO) {
    // Verifica Rate Limit ANTES de processar
    const rateLimitCheck = await RedisRateLimiter.checkVerificationAttempts(email);
    
    if (!rateLimitCheck.allowed) {
      return {
        status: 429, // Too Many Requests
        body: { message: rateLimitCheck.message },
      };
    }

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
      // Registra tentativa falhada
      await RedisRateLimiter.recordFailedAttempt(email);
      
      return {
        status: 400,
        body: { message: "Código inválido ou expirado" },
      };
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpiresAt = null;
    await repo.save(user);

    // Reseta tentativas após sucesso
    await RedisRateLimiter.resetAttempts(email);

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

  async resendCode({ email }: ResendCodeDTO) {
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

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationCode = newCode;
    user.verificationExpiresAt = newExpiresAt;

    await repo.save(user);

    const emailSent = await sendVerificationEmail(email, user.name, newCode);

    if (!emailSent) {
      return {
        status: 500,
        body: { message: "Falha ao enviar e-mail. Tente novamente." },
      };
    }

    return {
      status: 200,
      body: { message: "Novo código enviado para seu e-mail" },
    };
  }

    async requestPasswordRecovery({ email }: RequestPasswordRecoveryDTO) {
    // Verifica Rate Limit para evitar brute force
    const rateLimitCheck =
      await RedisRateLimiter.checkVerificationAttempts(email);

    if (!rateLimitCheck.allowed) {
      return {
        status: 429,
        body: { message: rateLimitCheck.message },
      };
    }

    const repo = userRepository();
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      return {
        status: 200,
        body: { message: "Se o e-mail existe, você receberá um código" },
      };
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationExpiresAt = verificationExpiresAt;
    await repo.save(user);

    const emailSent = await sendPasswordRecoveryEmail(
      email,
      user.name,
      verificationCode
    );

    if (!emailSent) {
      return {
        status: 500,
        body: { message: "Falha ao enviar e-mail. Tente novamente." },
      };
    }

    return {
      status: 200,
      body: { message: "Se o e-mail existe, você receberá um código" },
    };
  }

  async resetPassword({ email, recoveryCode, newPassword }: ResetPasswordDTO) {
    const rateLimitCheck =
      await RedisRateLimiter.checkVerificationAttempts(email);

    if (!rateLimitCheck.allowed) {
      return {
        status: 429,
        body: { message: rateLimitCheck.message },
      };
    }

    const repo = userRepository();
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      await RedisRateLimiter.recordFailedAttempt(email);
      return {
        status: 400,
        body: { message: "E-mail ou código inválido" },
      };
    }

    if (
      user.verificationCode !== recoveryCode ||
      !user.verificationExpiresAt ||
      user.verificationExpiresAt < new Date()
    ) {
      await RedisRateLimiter.recordFailedAttempt(email);
      return {
        status: 400,
        body: { message: "Código inválido ou expirado" },
      };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    user.passwordHash = passwordHash;
    user.verificationCode = null;
    user.verificationExpiresAt = null;
    await repo.save(user);

    await RedisRateLimiter.resetAttempts(email);

    return {
      status: 200,
      body: { message: "Senha redefinida com sucesso" },
    };
  }
}
