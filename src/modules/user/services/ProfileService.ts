import bcrypt from "bcrypt";
import { userRepository } from "../repositories/UserRepository";
import { sendVerificationEmail } from "../../../shared/providers/MailProvider";

interface UpdateProfileDTO {
  userId: string;
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface RequestEmailChangeDTO {
  userId: string;
  newEmail: string;
}

interface ConfirmEmailChangeDTO {
  userId: string;
  newEmail: string;
  verificationCode: string;
}

interface RequestAccountDeletionDTO {
  userId: string;
  password: string;
}

interface ConfirmAccountDeletionDTO {
  userId: string;
  verificationCode: string;
}

export class ProfileService {
  async getProfile(userId: string) {
    const repo = userRepository();

    const user = await repo.findOne({ where: { id: userId } });

    if (!user) {
      return {
        status: 404,
        body: { message: "Usuário não encontrado" },
      };
    }

    const {
      passwordHash,
      verificationCode,
      verificationExpiresAt,
      ...userWithoutSensitiveData
    } = user;

    return {
      status: 200,
      body: userWithoutSensitiveData,
    };
  }

  async updateProfile({
    userId,
    name,
    currentPassword,
    newPassword,
  }: UpdateProfileDTO) {
    const repo = userRepository();

    const user = await repo.findOne({ where: { id: userId } });

    if (!user) {
      return {
        status: 404,
        body: { message: "Usuário não encontrado" },
      };
    }

    if (name) {
      user.name = name;
    }

    if (newPassword && currentPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!isPasswordValid) {
        return {
          status: 401,
          body: { message: "Senha atual incorreta" },
        };
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await repo.save(user);

    const {
      passwordHash,
      verificationCode,
      verificationExpiresAt,
      ...userWithoutSensitiveData
    } = user;

    return {
      status: 200,
      body: {
        message: "Perfil atualizado com sucesso",
        user: userWithoutSensitiveData,
      },
    };
  }

  async requestEmailChange({ userId, newEmail }: RequestEmailChangeDTO) {
    const repo = userRepository();

    const user = await repo.findOne({ where: { id: userId } });

    if (!user) {
      return {
        status: 404,
        body: { message: "Usuário não encontrado" },
      };
    }

    const existingUser = await repo.findOne({ where: { email: newEmail } });
    if (existingUser) {
      return {
        status: 409,
        body: { message: "Este email já está em uso" },
      };
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationCode = newCode;
    user.verificationExpiresAt = newExpiresAt;

    await repo.save(user);

    const emailSent = await sendVerificationEmail(newEmail, user.name, newCode);

    if (!emailSent) {
      return {
        status: 500,
        body: { message: "Falha ao enviar e-mail. Tente novamente." },
      };
    }

    return {
      status: 200,
      body: { message: "Código de verificação enviado para o novo email" },
    };
  }

  async confirmEmailChange({
    userId,
    newEmail,
    verificationCode,
  }: ConfirmEmailChangeDTO) {
    const repo = userRepository();

    const user = await repo.findOne({ where: { id: userId } });

    if (!user) {
      return {
        status: 404,
        body: { message: "Usuário não encontrado" },
      };
    }

    if (
      user.verificationCode !== verificationCode ||
      !user.verificationExpiresAt ||
      user.verificationExpiresAt < new Date()
    ) {
      return {
        status: 400,
        body: { message: "Código inválido ou expirado" },
      };
    }

    user.email = newEmail;
    user.verificationCode = null;
    user.verificationExpiresAt = null;

    await repo.save(user);

    const {
      passwordHash,
      verificationCode: _code,
      verificationExpiresAt,
      ...userWithoutSensitiveData
    } = user;

    return {
      status: 200,
      body: {
        message: "Email atualizado com sucesso",
        user: userWithoutSensitiveData,
      },
    };
  }

  // Estratégia 2: senha apenas na etapa 1, código apenas na etapa 2

  async requestAccountDeletion({
    userId,
    password,
  }: RequestAccountDeletionDTO) {
    const repo = userRepository();

    const user = await repo.findOne({ where: { id: userId } });

    if (!user) {
      return {
        status: 404,
        body: { message: "Usuário não encontrado" },
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return {
        status: 401,
        body: { message: "Senha incorreta" },
      };
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationCode = newCode;
    user.verificationExpiresAt = newExpiresAt;

    await repo.save(user);

    const emailSent = await sendVerificationEmail(
      user.email,
      user.name,
      newCode
    );

    if (!emailSent) {
      return {
        status: 500,
        body: { message: "Falha ao enviar e-mail. Tente novamente." },
      };
    }

    return {
      status: 200,
      body: { message: "Código de verificação enviado para seu email" },
    };
  }

  async confirmAccountDeletion({
    userId,
    verificationCode,
  }: ConfirmAccountDeletionDTO) {
    const repo = userRepository();

    const user = await repo.findOne({ where: { id: userId } });

    if (!user) {
      return {
        status: 404,
        body: { message: "Usuário não encontrado" },
      };
    }

    if (
      user.verificationCode !== verificationCode ||
      !user.verificationExpiresAt ||
      user.verificationExpiresAt < new Date()
    ) {
      return {
        status: 400,
        body: { message: "Código inválido ou expirado" },
      };
    }

    await repo.delete({ id: userId });

    return {
      status: 200,
      body: { message: "Conta deletada com sucesso" },
    };
  }
}
