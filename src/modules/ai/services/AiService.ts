import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppDataSource } from "../../../data-source";
import { Transaction } from "../../financial/entities/Transaction";
import { Category } from "../../financial/entities/Category";
import { Conversation } from "../entities/Conversation";
import { TransactionRepository } from "../../financial/repositories/TransactionRepository";

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private transactionRepo: TransactionRepository;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.transactionRepo = new TransactionRepository();
  }

  /**
   * Chat financeiro personalizado com dados do usuário
   */
  async chat(userId: string, question: string): Promise<string> {
    try {
      // 1. Buscar últimas transações do usuário
      const { data: recentTransactions } = await this.transactionRepo.findByUserId(userId, 10, 0);

      // 2. Buscar saldo do mês atual
      const now = new Date();
      const totalIncomeCents = await this.transactionRepo.getTotalIncome(
        userId,
        now.getMonth() + 1,
        now.getFullYear()
      );
      const totalExpenseCents = await this.transactionRepo.getTotalExpense(
        userId,
        now.getMonth() + 1,
        now.getFullYear()
      );

      // Converter centavos para reais
      const totalIncome = totalIncomeCents / 100;
      const totalExpense = totalExpenseCents / 100;

      // 3. Montar resumo das transações
      const transactionSummary = recentTransactions
        .map(
          (t) =>
            `- ${new Date(t.date).toLocaleDateString("pt-BR")}: ${t.description} | R$ ${(t.amountCents / 100).toFixed(2)} (${t.category?.name || "Sem categoria"})`
        )
        .join("\n");

      // 4. Montar o prompt
      const prompt = `
        Você é um consultor financeiro pessoal do aplicativo Braz Clean Finance.
        
        **Dados Atuais do Usuário:**
        - Saldo este mês: R$ ${(totalIncome - totalExpense).toFixed(2)}
        - Receitas (mês atual): R$ ${totalIncome.toFixed(2)}
        - Despesas (mês atual): R$ ${totalExpense.toFixed(2)}
        
        **Últimas Transações:**
        ${transactionSummary || "Nenhuma transação registrada"}
        
        **Pergunta do usuário:** ${question}
        
        Responda de forma clara, prática e em tom amigável (português brasileiro).
        Forneça dicas específicas baseadas nos dados reais do usuário.
        Se a pergunta não for relacionada a finanças, responda educadamente que você é especializado em gestão financeira.
      `;

      // 5. Chamar a IA
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Salvar no histórico
      const conversationRepo = AppDataSource.getRepository(Conversation);
      await conversationRepo.save({
        user_id: userId,
        question,
        response: text,
        type: "chat",
      });

      return text;
    } catch (error) {
      console.error("Erro ao chamar Gemini (chat):", error);
      throw new Error("Falha ao processar sua pergunta.");
    }
  }

  /**
   * Gerar relatório mensal inteligente
   */
  async generateMonthlyReport(
    userId: string,
    month: number,
    year: number
  ): Promise<string> {
    try {
      const transactions = await this.transactionRepo.findByMonthYear(userId, month, year);

      if (transactions.length === 0) {
        return `Nenhuma transação registrada em ${month}/${year}. Comece a registrar suas movimentações financeiras!`;
      }

      // Buscar totais usando os métodos do repository
      const totalIncomeCents = await this.transactionRepo.getTotalIncome(userId, month, year);
      const totalExpenseCents = await this.transactionRepo.getTotalExpense(userId, month, year);

      const totalIncome = totalIncomeCents / 100;
      const totalExpense = totalExpenseCents / 100;

      // Resumir por categoria
      const categorySpending: Record<string, number> = {};

      transactions.forEach((t) => {
        const amountReais = t.amountCents / 100;
        const categoryName = t.category?.name || "Sem categoria";
        categorySpending[categoryName] = (categorySpending[categoryName] || 0) + amountReais;
      });

      const categoryBreakdown = Object.entries(categorySpending)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .map(([cat, value]) => `- ${cat}: R$ ${Math.abs(value).toFixed(2)}`)
        .join("\n");

      const prompt = `
        Você é um consultor financeiro especializado em análise de despesas pessoais.
        
        **Período:** ${month}/${year}
        
        **Resumo Financeiro:**
        - Receitas totais: R$ ${totalIncome.toFixed(2)}
        - Despesas totais: R$ ${totalExpense.toFixed(2)}
        - Saldo: R$ ${(totalIncome - totalExpense).toFixed(2)}
        - Total de transações: ${transactions.length}
        
        **Gastos por Categoria:**
        ${categoryBreakdown}
        
        **Transações:**
        ${transactions
          .map(
            (t) =>
              `${new Date(t.date).toLocaleDateString("pt-BR")}: ${t.description} (${t.category?.name}) - R$ ${(t.amountCents / 100).toFixed(2)}`
          )
          .join("\n")}
        
        Forneça:
        1. Um resumo do padrão de gastos
        2. A categoria com maior gasto
        3. Três recomendações práticas baseadas nestes dados específicos
        4. Um score de saúde financeira (0-10) com explicação
        
        Responda em tom motivador e construtivo (português brasileiro).
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Salvar no histórico
      const conversationRepo = AppDataSource.getRepository(Conversation);
      await conversationRepo.save({
        user_id: userId,
        question: `Relatório ${month}/${year}`,
        response: text,
        type: "report",
      });

      return text;
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      throw new Error("Falha ao gerar relatório mensal.");
    }
  }

  /**
   * Analisar gastos de uma categoria específica
   */
  async analyzeCategorySpending(
    userId: string,
    categoryId: string,
    month: number,
    year: number
  ): Promise<string> {
    try {
      const categoryRepo = AppDataSource.getRepository(Category);

      const category = await categoryRepo.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new Error("Categoria não encontrada");
      }

      const transactions = await this.transactionRepo.findByCategory(userId, categoryId);
      
      // Filtrar por mês/ano
      const filteredTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() + 1 === month && tDate.getFullYear() === year;
      });

      if (filteredTransactions.length === 0) {
        return `Nenhuma transação em "${category.name}" durante ${month}/${year}.`;
      }

      const totalCents = filteredTransactions.reduce((sum, t) => sum + t.amountCents, 0);
      const totalReais = totalCents / 100;
      const averageReais = totalReais / filteredTransactions.length;

      const transactionList = filteredTransactions
        .map(
          (t) =>
            `${new Date(t.date).toLocaleDateString("pt-BR")}: ${t.description} - R$ ${(t.amountCents / 100).toFixed(2)}`
        )
        .join("\n");

      const prompt = `
        Analise os gastos na categoria "${category.name}" de um usuário.
        
        **Dados:**
        - Período: ${month}/${year}
        - Total de transações: ${filteredTransactions.length}
        - Valor total: R$ ${Math.abs(totalReais).toFixed(2)}
        - Média por transação: R$ ${Math.abs(averageReais).toFixed(2)}
        
        **Transações:**
        ${transactionList}
        
        Forneça:
        1. Análise do padrão de consumo
        2. Se há como reduzir gastos (seja específico)
        3. Comparação: este gasto é normal para a categoria?
        
        Responda em português brasileiro, de forma prática e acionável.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Salvar no histórico
      const conversationRepo = AppDataSource.getRepository(Conversation);
      await conversationRepo.save({
        user_id: userId,
        question: `Análise: ${category.name} ${month}/${year}`,
        response: text,
        type: "analysis",
      });

      return text;
    } catch (error) {
      console.error("Erro ao analisar categoria:", error);
      throw new Error("Falha ao analisar categoria.");
    }
  }
}
