import { Repository } from "typeorm";
import { AppDataSource } from "../../../data-source";
import { Transaction, TransactionStatus } from "../entities/Transaction";

export class TransactionRepository {
  private repo: Repository<Transaction>;

  constructor() {
    this.repo = AppDataSource.getRepository(Transaction);
  }

  /**
   * Criar nova transação
   */
  async create(data: {
    userId: string;
    categoryId: string;
    amountCents: number;
    description: string;
    date: Date;
    notes?: string;
  }): Promise<Transaction> {
    const transaction = this.repo.create({
      userId: data.userId,
      categoryId: data.categoryId,
      amountCents: data.amountCents,
      description: data.description,
      date: data.date,
      notes: data.notes,
      status: TransactionStatus.COMPLETED,
    });

    return this.repo.save(transaction);
  }

  /**
   * Buscar transação por ID
   */
  async findById(id: string): Promise<Transaction | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["user", "category"],
    });
  }

  /**
   * Buscar todas as transações do usuário
   */
  async findByUserId(
    userId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<{ data: Transaction[]; total: number }> {
    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      relations: ["category"],
      order: { date: "DESC" },
      take: limit,
      skip,
    });

    return { data, total };
  }

  /**
   * Buscar transações por período (mês/ano)
   */
  async findByMonthYear(
    userId: string,
    month: number,
    year: number
  ): Promise<Transaction[]> {
    return this.repo
      .createQueryBuilder("transaction")
      .where("transaction.userId = :userId", { userId })
      .andWhere("EXTRACT(MONTH FROM transaction.date) = :month", { month })
      .andWhere("EXTRACT(YEAR FROM transaction.date) = :year", { year })
      .leftJoinAndSelect("transaction.category", "category")
      .orderBy("transaction.date", "DESC")
      .getMany();
  }

  /**
   * Buscar transações por categoria
   */
  async findByCategory(
    userId: string,
    categoryId: string
  ): Promise<Transaction[]> {
    return this.repo.find({
      where: { userId, categoryId },
      relations: ["category"],
      order: { date: "DESC" },
    });
  }

  /**
   * Atualizar transação
   */
  async update(
    id: string,
    data: Partial<{
      amountCents: number;
      description: string;
      date: Date;
      categoryId: string;
      notes: string;
      status: TransactionStatus;
    }>
  ): Promise<Transaction | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  /**
   * Deletar transação
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Calcular total de receitas no mês
   */
  async getTotalIncome(
    userId: string,
    month: number,
    year: number
  ): Promise<number> {
    const result = await this.repo
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amountCents)", "total")
      .where("transaction.userId = :userId", { userId })
      .andWhere("EXTRACT(MONTH FROM transaction.date) = :month", { month })
      .andWhere("EXTRACT(YEAR FROM transaction.date) = :year", { year })
      .andWhere("transaction.category.type = :type", { type: "income" })
      .leftJoin("transaction.category", "category")
      .getRawOne();

    return parseInt(result?.total) || 0;
  }

  /**
   * Calcular total de despesas no mês
   */
  async getTotalExpense(
    userId: string,
    month: number,
    year: number
  ): Promise<number> {
    const result = await this.repo
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amountCents)", "total")
      .where("transaction.userId = :userId", { userId })
      .andWhere("EXTRACT(MONTH FROM transaction.date) = :month", { month })
      .andWhere("EXTRACT(YEAR FROM transaction.date) = :year", { year })
      .andWhere("transaction.category.type = :type", { type: "expense" })
      .leftJoin("transaction.category", "category")
      .getRawOne();

    return parseInt(result?.total) || 0;
  }

  /**
   * Saldo total (receitas - despesas)
   */
  async getBalance(
    userId: string,
    month: number,
    year: number
  ): Promise<number> {
    const income = await this.getTotalIncome(userId, month, year);
    const expense = await this.getTotalExpense(userId, month, year);
    return income - expense;
  }

  /**
   * Buscar todas as transações (admin)
   */
  async findAll(limit: number = 100, skip: number = 0): Promise<{ data: Transaction[]; total: number }> {
    const [data, total] = await this.repo.findAndCount({
      relations: ["user", "category"],
      order: { date: "DESC" },
      take: limit,
      skip,
    });

    return { data, total };
  }

  /**
   * Contar transações do usuário
   */
  async countByUserId(userId: string): Promise<number> {
    return this.repo.count({ where: { userId } });
  }

  /**
   * Verificar se transação existe
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.repo.count({ where: { id } });
    return count > 0;
  }
}
