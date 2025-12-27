import { Request, Response } from "express";
import { CategoryService } from "../services/CategoryService";
import { AppError } from "../../../shared/error/AppError";

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  /**
   * GET /categories - Listar todas as categorias
   */
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await this.categoryService.getAllCategories();

      return res.status(200).json({
        success: true,
        data: categories,
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
        error: "Erro ao buscar categorias",
      });
    }
  }

  /**
   * GET /categories/type/:type - Listar categorias por tipo
   */
  async getByType(req: Request, res: Response): Promise<Response> {
    try {
      const { type } = req.params;

      const categories = await this.categoryService.getCategoriesByType(type);

      return res.status(200).json({
        success: true,
        data: categories,
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
        error: "Erro ao buscar categorias",
      });
    }
  }

  /**
   * GET /categories/:id - Obter categoria por ID
   */
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const category = await this.categoryService.getCategoryById(id);

      return res.status(200).json({
        success: true,
        data: category,
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
        error: "Erro ao buscar categoria",
      });
    }
  }

  /**
   * GET /categories/slug/:slug - Obter categoria por slug
   */
  async getBySlug(req: Request, res: Response): Promise<Response> {
    try {
      const { slug } = req.params;

      const category = await this.categoryService.getCategoryBySlug(slug);

      return res.status(200).json({
        success: true,
        data: category,
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
        error: "Erro ao buscar categoria",
      });
    }
  }
}
