import { Repository } from "typeorm";
import { AppDataSource } from "../../../data-source";
import { Category, TransactionType } from "../entities/Category";

export class CategoryRepository {
  private repo: Repository<Category>;

  constructor() {
    this.repo = AppDataSource.getRepository(Category);
  }

  /**
   * Buscar categoria por ID
   */
  async findById(id: string): Promise<Category | null> {
    return this.repo.findOne({ where: { id, isActive: true } });
  }

  /**
   * Buscar todas as categorias por tipo
   */
  async findByType(type: TransactionType): Promise<Category[]> {
    return this.repo.find({ where: { type, isActive: true } });
  }

  /**
   * Listar todas as categorias
   */
  async findAll(): Promise<Category[]> {
    return this.repo.find({ where: { isActive: true } });
  }

  /**
   * Buscar por slug
   */
  async findBySlug(slug: string): Promise<Category | null> {
    return this.repo.findOne({ where: { slug, isActive: true } });
  }

  /**
   * Criar categoria
   */
  async create(data: {
    name: string;
    slug: string;
    type: TransactionType;
    icon?: string;
    color?: string;
  }): Promise<Category> {
    const category = this.repo.create(data);
    return this.repo.save(category);
  }

  /**
   * Atualizar categoria
   */
  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }
}
