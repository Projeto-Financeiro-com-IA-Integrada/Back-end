import { AppError } from "../../../shared/error/AppError";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { TransactionRepository } from "../repositories/TransactionRepository";
import { createTransactionSchema, updateTransactionSchema } from "../schemas/transactionSchemas";
import { Transaction } from "../entities/Transaction";
import { fromBRL, formatBRL, toBRL } from "../../../utils/currency";

export class TransactionService {
  private transactionRepository: TransactionRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Criar nova transação
   */
  async createTransaction(userId: string, data: any) {
    // Validar com Zod
    const validated = createTransactionSchema.parse(data);

    // Verificar se categoria existe
    const category = await this.categoryRepository.findById(validated.categoryId);
    if (!category) {
      throw new AppError("Categoria não encontrada", 404);
    }

    // Converter valor para centavos
    const amountCents = toBRL(validated.amount);

    // Criar transação
    const transaction = await this.transactionRepository.create({
      userId,
      categoryId: validated.categoryId,
      amountCents,
      description: validated.description,
      date: new Date(validated.date),
      notes: validated.notes,
    });

    return this.formatTransactionResponse(transaction);
  }

  /**
   * Obter transação por ID
   */
  async getTransactionById(userId: string, transactionId: string) {
    const transaction = await this.transactionRepository.findById(transactionId);

    if (!transaction || transaction.userId !== userId) {
      throw new AppError("Transação não encontrada", 404);
    }

    return this.formatTransactionResponse(transaction);
  }

  /**
   * Listar transações do usuário (com paginação)
   */
  async listTransactions(
    userId: string,
    limit: number = 20,
    page: number = 1
  ) {
    const skip = (page - 1) * limit;

    const { data, total } = await this.transactionRepository.findByUserId(
      userId,
      limit,
      skip
    );

    return {
      data: data.map((t) => this.formatTransactionResponse(t)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Listar transações do mês
   */
  async getMonthlyTransactions(userId: string, month: number, year: number) {
    if (month < 1 || month > 12) {
      throw new AppError("Mês inválido", 400);
    }

    const transactions = await this.transactionRepository.findByMonthYear(
      userId,
      month,
      year
    );

    const income = await this.transactionRepository.getTotalIncome(
      userId,
      month,
      year
    );
    const expense = await this.transactionRepository.getTotalExpense(
      userId,
      month,
      year
    );

    return {
      transactions: transactions.map((t) => this.formatTransactionResponse(t)),
      summary: {
        totalIncome: fromBRL(income),
        totalExpense: fromBRL(expense),
        balance: fromBRL(income - expense),
        totalIncomeFormatted: formatBRL(income),
        totalExpenseFormatted: formatBRL(expense),
        balanceFormatted: formatBRL(income - expense),
      },
    };
  }

  /**
   * Atualizar transação
   */
  async updateTransaction(
    userId: string,
    transactionId: string,
    data: any
  ) {
    // Verificar se transação pertence ao usuário
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction || transaction.userId !== userId) {
      throw new AppError("Transação não encontrada", 404);
    }

    // Validar dados
    const validated = updateTransactionSchema.parse(data);

    // Se houver categoria, verificar
    if (validated.categoryId) {
      const category = await this.categoryRepository.findById(
        validated.categoryId
      );
      if (!category) {
        throw new AppError("Categoria não encontrada", 404);
      }
    }

    // Preparar dados para atualizar
    const updateData: any = {};
    if (validated.amount !== undefined) {
      updateData.amountCents = toBRL(validated.amount);
    }
    if (validated.description) updateData.description = validated.description;
    if (validated.date) updateData.date = new Date(validated.date);
    if (validated.categoryId) updateData.categoryId = validated.categoryId;
    if (validated.notes) updateData.notes = validated.notes;

    const updated = await this.transactionRepository.update(
      transactionId,
      updateData
    );

    if (!updated) {
      throw new AppError("Erro ao atualizar transação", 500);
    }

    return this.formatTransactionResponse(updated);
  }

  /**
   * Deletar transação
   */
  async deleteTransaction(userId: string, transactionId: string) {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction || transaction.userId !== userId) {
      throw new AppError("Transação não encontrada", 404);
    }

    const deleted = await this.transactionRepository.delete(transactionId);

    if (!deleted) {
      throw new AppError("Erro ao deletar transação", 500);
    }

    return { message: "Transação deletada com sucesso" };
  }

  /**
   * Buscar transações por categoria
   */
  async getTransactionsByCategory(userId: string, categoryId: string) {
    const transactions = await this.transactionRepository.findByCategory(
      userId,
      categoryId
    );

    return transactions.map((t) => this.formatTransactionResponse(t));
  }

  /**
   * Obter resumo financeiro do mês
   */
  async getMonthlyBalance(userId: string, month: number, year: number) {
    const balance = await this.transactionRepository.getBalance(
      userId,
      month,
      year
    );
    const income = await this.transactionRepository.getTotalIncome(
      userId,
      month,
      year
    );
    const expense = await this.transactionRepository.getTotalExpense(
      userId,
      month,
      year
    );

    return {
      month,
      year,
      income: fromBRL(income),
      expense: fromBRL(expense),
      balance: fromBRL(balance),
      incomeFormatted: formatBRL(income),
      expenseFormatted: formatBRL(expense),
      balanceFormatted: formatBRL(balance),
    };
  }

  /**
   * Formatar resposta de transação
   */
  private formatTransactionResponse(transaction: Transaction) {
    return {
      id: transaction.id,
      amount: fromBRL(transaction.amountCents),
      amountFormatted: formatBRL(transaction.amountCents),
      description: transaction.description,
      date: transaction.date.toISOString().split("T"),
      status: transaction.status,
      category: {
        id: transaction.category.id,
        name: transaction.category.name,
        type: transaction.category.type,
        icon: transaction.category.icon,
        color: transaction.category.color,
      },
      notes: transaction.notes || null,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}

