import { Request, Response } from "express";
import { ProfileService } from "../services/ProfileService";
import {
  updateProfileSchema,
  requestEmailChangeSchema,
  confirmEmailChangeSchema,
  requestAccountDeletionSchema,
  confirmAccountDeletionSchema,
} from "../schemas/profileSchemas";

const profileService = new ProfileService();

export class ProfileController {
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const result = await profileService.getProfile(userId);

      return res.status(result.status).json(result.body);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const validated = updateProfileSchema.parse(req.body);

      const result = await profileService.updateProfile({
        userId,
        ...validated,
      });

      return res.status(result.status).json(result.body);
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({ errors: err.errors });
      }
      console.error(err);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async requestEmailChange(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { newEmail } = requestEmailChangeSchema.parse(req.body);

      const result = await profileService.requestEmailChange({
        userId,
        newEmail,
      });

      return res.status(result.status).json(result.body);
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({ errors: err.errors });
      }
      console.error(err);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async confirmEmailChange(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { newEmail, verificationCode } =
        confirmEmailChangeSchema.parse(req.body);

      const result = await profileService.confirmEmailChange({
        userId,
        newEmail,
        verificationCode,
      });

      return res.status(result.status).json(result.body);
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({ errors: err.errors });
      }
      console.error(err);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async requestAccountDeletion(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { password } = requestAccountDeletionSchema.parse(req.body);

      const result = await profileService.requestAccountDeletion({
        userId,
        password,
      });

      return res.status(result.status).json(result.body);
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({ errors: err.errors });
      }
      console.error(err);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async confirmAccountDeletion(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { verificationCode } = confirmAccountDeletionSchema.parse(req.body);

      const result = await profileService.confirmAccountDeletion({
        userId,
        verificationCode,
      });

      return res.status(result.status).json(result.body);
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({ errors: err.errors });
      }
      console.error(err);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}
