import { Router } from "express";
import { ProfileController } from "../modules/user/controllers/ProfileController";
import { ensureAuth } from "../middlewares/ensureAuth";
import { validateBody } from "../middlewares/validateBody";

import {
  updateProfileSchema,
  requestEmailChangeSchema,
  confirmEmailChangeSchema,
  requestAccountDeletionSchema,
  confirmAccountDeletionSchema,
} from "../modules/user/schemas/profileSchemas";

const profileRouter = Router();
const controller = new ProfileController();

profileRouter.use(ensureAuth);


profileRouter.get("/profile", (req, res) => controller.getProfile(req, res));

profileRouter.patch("/profile", validateBody(updateProfileSchema), (req, res) =>
  controller.updateProfile(req, res)
);

profileRouter.post("/profile/email/request",validateBody(requestEmailChangeSchema), (req, res) =>
  controller.requestEmailChange(req, res)
);

profileRouter.patch("/profile/email/confirm", validateBody(confirmEmailChangeSchema), (req, res) =>
  controller.confirmEmailChange(req, res)
);

profileRouter.post("/profile/delete/request", validateBody(requestAccountDeletionSchema), (req, res) =>
  controller.requestAccountDeletion(req, res)
);

profileRouter.delete("/profile/delete/confirm",  validateBody(confirmAccountDeletionSchema), (req, res) =>
  controller.confirmAccountDeletion(req, res)
);

export { profileRouter };
