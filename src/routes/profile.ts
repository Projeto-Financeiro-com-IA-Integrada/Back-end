import { Router } from "express";
import { ProfileController } from "../modules/user/controllers/ProfileController";
import { ensureAuth } from "../middlewares/ensureAuth";
import { validateBody } from "../middlewares/validateBody"; // se quiser usar com schemas

const profileRouter = Router();
const controller = new ProfileController();

profileRouter.use(ensureAuth);


profileRouter.get("/profile", (req, res) => controller.getProfile(req, res));

profileRouter.patch("/profile", (req, res) =>
  controller.updateProfile(req, res)
);

profileRouter.post("/profile/email/request", (req, res) =>
  controller.requestEmailChange(req, res)
);

profileRouter.patch("/profile/email/confirm", (req, res) =>
  controller.confirmEmailChange(req, res)
);

profileRouter.post("/profile/delete/request", (req, res) =>
  controller.requestAccountDeletion(req, res)
);

profileRouter.delete("/profile/delete/confirm", (req, res) =>
  controller.confirmAccountDeletion(req, res)
);

export { profileRouter };
