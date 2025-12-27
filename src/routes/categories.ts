import { Router } from "express";
import { CategoryController } from "../modules/financial/controllers/CategoryController";

const router = Router();
const categoryController = new CategoryController();


router.get("/", (req, res) => categoryController.getAll(req, res));

router.get("/type/:type", (req, res) => categoryController.getByType(req, res));

router.get("/slug/:slug", (req, res) => categoryController.getBySlug(req, res));

router.get("/:id", (req, res) => categoryController.getById(req, res));

export { router as categoriesRouter };
