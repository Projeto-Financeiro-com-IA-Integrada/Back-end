import { Router } from "express";
import { AIController } from "../modules/ai/controllers/AIController";
import { ensureAuth } from "../middlewares/ensureAuth";
import { validateBody } from "../middlewares/validateBody";
import {
  chatRequestSchema,
  generateMonthlyReportSchema,
  analyzeCategorySchema,
} from "../modules/ai/schemas/aiSchemas";

const router = Router();
const aiController = new AIController();

// Aplicar autenticação em todas as rotas
router.use(ensureAuth);

/**
 * POST /ai/chat
 * Chat financeiro com IA
 * Body: { question: string }
 */
router.post(
  "/chat",
  validateBody(chatRequestSchema),
  (req, res) => aiController.chat(req, res)
);

/**
 * POST /ai/report
 * Gerar relatório mensal
 * Body: { month: number, year: number }
 */
router.post(
  "/report",
  validateBody(generateMonthlyReportSchema),
  (req, res) => aiController.generateReport(req, res)
);

/**
 * POST /ai/analyze-category
 * Analisar gastos de uma categoria
 * Body: { categoryId: string, month: number, year: number }
 */
router.post(
  "/analyze-category",
  validateBody(analyzeCategorySchema),
  (req, res) => aiController.analyzeCategory(req, res)
);

export { router as aiRouter };
