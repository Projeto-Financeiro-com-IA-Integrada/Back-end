import { Request, Response } from "express";
import { AIService } from "../services/AiService";

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async chat(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const { question } = req.body;

      const response = await this.aiService.chat(userId, question);
      return res.json({ response });
    } catch (error) {
      console.error("Erro no chat:", error);
      return res.status(500).json({ error: "Erro ao processar pergunta" });
    }
  }

  async generateReport(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const { month, year } = req.body;

      const report = await this.aiService.generateMonthlyReport(
        userId,
        month,
        year
      );
      return res.json({ report });
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      return res.status(500).json({ error: "Erro ao gerar relatório" });
    }
  }

  async analyzeCategory(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user.id;
      const { categoryId, month, year } = req.body;

      const analysis = await this.aiService.analyzeCategorySpending(
        userId,
        categoryId,
        month,
        year
      );
      return res.json({ analysis });
    } catch (error) {
      console.error("Erro ao analisar categoria:", error);
      return res.status(500).json({ error: "Erro ao analisar categoria" });
    }
  }
}
