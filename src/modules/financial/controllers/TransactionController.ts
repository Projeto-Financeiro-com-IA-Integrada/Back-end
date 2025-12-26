import { Request, Response } from "express";
import { TransactionService } from "../services/TransactionService";
import { AppError } from "../../../shared/error/AppError";

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  /**
   * POST /transactions - Criar transação
   */
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.userId; // Vem do middleware de autenticação
      const transaction = await this.transactionService.createTransaction(
        userId!,
        req.body
      );

      return res.status(201).json({
        success: true,
        message: "Transação criada com sucesso",
        data: transaction,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro ao criar transação",
      });
    }
  }

  /**
   * GET /transactions/:id - Obter transação por ID
   */
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const transaction = await this.transactionService.getTransactionById(
        userId!,
        id
      );

      return res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: "Erro ao buscar transação",
      });
    }
  }

  /**
   * GET /transactions - Listar transações do usuário
   */
  async list(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit as string) || 20;
      const page = parseInt(req.query.page as string) || 1;

      const result = await this.transactionService.listTransactions(
        userId!,
        limit,
        page
      );

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Erro ao listar transações",
      });
    }
  }

  /**
   * GET /transactions/month/:year/:month - Transações do mês
   */
  async getMonthly(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      const { month, year } = req.params;

      const result = await this.transactionService.getMonthlyTransactions(
        userId!,
        parseInt(month),
        parseInt(year)
      );

      return res.status(200).json({
        success: true,
        data: result.transactions,
        summary: result.summary,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: "Erro ao buscar transações do mês",
      });
    }
  }

  /**
   * GET /transactions/balance/:year/:month - Saldo do mês
   */
  async getBalance(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      const { month, year } = req.params;

      const balance = await this.transactionService.getMonthlyBalance(
        userId!,
        parseInt(month),
        parseInt(year)
      );

      return res.status(200).json({
        success: true,
        data: balance,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: "Erro ao calcular saldo",
      });
    }
  }

  /**
   * PATCH /transactions/:id - Atualizar transação
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const transaction = await this.transactionService.updateTransaction(
        userId!,
        id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Transação atualizada com sucesso",
        data: transaction,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro ao atualizar transação",
      });
    }
  }

  /**
   * DELETE /transactions/:id - Deletar transação
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const result = await this.transactionService.deleteTransaction(userId!, id);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: "Erro ao deletar transação",
      });
    }
  }

  /**
   * GET /transactions/category/:categoryId - Transações por categoria
   */
  async getByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      const { categoryId } = req.params;

      const transactions = await this.transactionService.getTransactionsByCategory(
        userId!,
        categoryId
      );

      return res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Erro ao buscar transações da categoria",
      });
    }
  }
}
