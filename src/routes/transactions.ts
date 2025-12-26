import { Router } from "express";
import { TransactionController } from "../modules/financial/controllers/TransactionController";
import { ensureAuth } from "../middlewares/ensureAuth";
import { validateBody } from "../middlewares/validateBody";
import { createTransactionSchema, updateTransactionSchema } from "../modules/financial/schemas/transactionSchemas";

const router = Router();
const transactionController = new TransactionController();

// Middleware de autenticação em todas as rotas
router.use(ensureAuth);

/**
 * POST /transactions
 * Criar nova transação
 */
router.post(
  "/",
  validateBody(createTransactionSchema),
  (req, res) => transactionController.create(req, res)
);

/**
 * GET /transactions
 * Listar transações do usuário (com paginação)
 */
router.get("/", (req, res) => transactionController.list(req, res));

/**
 * GET /transactions/month/:year/:month
 * Obter transações de um mês específico
 */
router.get("/month/:year/:month", (req, res) =>
  transactionController.getMonthly(req, res)
);

/**
 * GET /transactions/balance/:year/:month
 * Obter saldo do mês (receitas - despesas)
 */
router.get("/balance/:year/:month", (req, res) =>
  transactionController.getBalance(req, res)
);

/**
 * GET /transactions/category/:categoryId
 * Obter transações de uma categoria específica
 */
router.get("/category/:categoryId", (req, res) =>
  transactionController.getByCategory(req, res)
);

/**
 * GET /transactions/:id
 * Obter transação por ID
 */
router.get("/:id", (req, res) => transactionController.getById(req, res));

/**
 * PATCH /transactions/:id
 * Atualizar transação
 */
router.patch(
  "/:id",
  validateBody(updateTransactionSchema),
  (req, res) => transactionController.update(req, res)
);

/**
 * DELETE /transactions/:id
 * Deletar transação
 */
router.delete("/:id", (req, res) => transactionController.delete(req, res));

export { router as transactionsRouter };
