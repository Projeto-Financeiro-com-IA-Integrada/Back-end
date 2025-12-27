import { CategoryRepository } from "../repositories/CategoryRepository";
import { TransactionType } from "../entities/Category";
import { AppError } from "../../../shared/error/AppError";

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Buscar todas as categorias
   */
  async getAllCategories() {
    const categories = await this.categoryRepository.findAll();

    if (!categories || categories.length === 0) {
      throw new AppError("Nenhuma categoria encontrada", 404);
    }

    return categories;
  }

  /**
   * Buscar categorias por tipo (income ou expense)
   */
  async getCategoriesByType(type: string) {
    // Validar o tipo
    if (!["income", "expense"].includes(type)) {
      throw new AppError("Tipo deve ser 'income' ou 'expense'", 400);
    }

    // Converter string para TransactionType enum
    const transactionType = type === "income" ? TransactionType.INCOME : TransactionType.EXPENSE;

    const categories = await this.categoryRepository.findByType(transactionType);

    if (!categories || categories.length === 0) {
      throw new AppError(`Nenhuma categoria de tipo '${type}' encontrada`, 404);
    }

    return categories;
  }

  /**
   * Buscar categoria por ID
   */
  async getCategoryById(categoryId: string) {
    const category = await this.categoryRepository.findById(categoryId);

    if (!category) {
      throw new AppError("Categoria não encontrada", 404);
    }

    return category;
  }

  /**
   * Buscar categoria por slug
   */
  async getCategoryBySlug(slug: string) {
    const category = await this.categoryRepository.findBySlug(slug);

    if (!category) {
      throw new AppError("Categoria não encontrada", 404);
    }

    return category;
  }
}
