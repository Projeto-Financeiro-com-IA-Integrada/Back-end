import { DataSource } from "typeorm";
import { Category, TransactionType } from "../../modules/financial/entities/Category";

export const categoriesSeed = async (dataSource: DataSource) => {
  const categoryRepository = dataSource.getRepository(Category);

  const incomeCategories = [
    { name: "Salário", slug: "salary", type: TransactionType.INCOME, icon: "💼", color: "#4CAF50" },
    { name: "Freelas/Autônomo", slug: "freelance", type: TransactionType.INCOME, icon: "💻", color: "#2196F3" },
    { name: "Investimentos", slug: "investment_returns", type: TransactionType.INCOME, icon: "📈", color: "#FF9800" },
    { name: "13º Salário", slug: "thirteenth_salary", type: TransactionType.INCOME, icon: "🎁", color: "#9C27B0" },
    { name: "Outras Receitas", slug: "other_income", type: TransactionType.INCOME, icon: "💰", color: "#00BCD4" }
  ];

  const expenseCategories = [
    // Moradia
    { name: "Aluguel", slug: "rent", type: TransactionType.EXPENSE, icon: "🏠", color: "#F44336" },
    { name: "Condomínio", slug: "condo_fee", type: TransactionType.EXPENSE, icon: "🏢", color: "#E91E63" },
    
    // Transporte
    { name: "Combustível", slug: "fuel", type: TransactionType.EXPENSE, icon: "⛽", color: "#9E9E9E" },
    { name: "Uber/Táxi", slug: "uber_taxi", type: TransactionType.EXPENSE, icon: "🚗", color: "#607D8B" },
    { name: "Transporte Público", slug: "public_transport", type: TransactionType.EXPENSE, icon: "🚌", color: "#795548" },
    
    // Alimentação
    { name: "Supermercado", slug: "groceries", type: TransactionType.EXPENSE, icon: "🛒", color: "#4CAF50" },
    { name: "Restaurantes", slug: "restaurants", type: TransactionType.EXPENSE, icon: "🍽️", color: "#FF5722" },
    { name: "Delivery", slug: "delivery", type: TransactionType.EXPENSE, icon: "🛵", color: "#FF9800" },
    
    // Saúde
    { name: "Plano de Saúde", slug: "health_insurance", type: TransactionType.EXPENSE, icon: "🏥", color: "#2196F3" },
    { name: "Farmácia", slug: "pharmacy", type: TransactionType.EXPENSE, icon: "💊", color: "#03A9F4" },
    { name: "Academia", slug: "gym", type: TransactionType.EXPENSE, icon: "💪", color: "#00BCD4" },
    
    // Educação
    { name: "Cursos", slug: "courses", type: TransactionType.EXPENSE, icon: "📚", color: "#3F51B5" },
    { name: "Livros", slug: "books", type: TransactionType.EXPENSE, icon: "📖", color: "#673AB7" },
    
    // Lazer
    { name: "Streaming", slug: "streaming", type: TransactionType.EXPENSE, icon: "📺", color: "#9C27B0" },
    { name: "Viagens", slug: "travel", type: TransactionType.EXPENSE, icon: "✈️", color: "#E91E63" },
    { name: "Hobbies", slug: "hobbies", type: TransactionType.EXPENSE, icon: "🎮", color: "#F44336" },
    
    // Contas
    { name: "Energia Elétrica", slug: "electricity", type: TransactionType.EXPENSE, icon: "⚡", color: "#FFEB3B" },
    { name: "Água", slug: "water", type: TransactionType.EXPENSE, icon: "💧", color: "#2196F3" },
    { name: "Internet", slug: "internet", type: TransactionType.EXPENSE, icon: "🌐", color: "#00BCD4" },
    { name: "Telefone", slug: "phone", type: TransactionType.EXPENSE, icon: "📱", color: "#009688" },
    
    // Compras Pessoais
    { name: "Roupas", slug: "clothing", type: TransactionType.EXPENSE, icon: "👕", color: "#E91E63" },
    { name: "Salão/Barbearia", slug: "beauty_salon", type: TransactionType.EXPENSE, icon: "💇", color: "#9C27B0" },
    
    // Financeiro
    { name: "Investimentos", slug: "investments", type: TransactionType.EXPENSE, icon: "📊", color: "#4CAF50" },
    { name: "Cartão de Crédito", slug: "credit_card_payment", type: TransactionType.EXPENSE, icon: "💳", color: "#FF5722" },
    
    // Outros
    { name: "Outras Despesas", slug: "other_expenses", type: TransactionType.EXPENSE, icon: "📝", color: "#9E9E9E" }
  ];

  const allCategories = [...incomeCategories, ...expenseCategories];

  for (const category of allCategories) {
    const exists = await categoryRepository.findOne({ 
      where: { slug: category.slug } 
    });
    
    if (!exists) {
      await categoryRepository.save(category);
    }
  }

  console.log("✅ Categorias inseridas com sucesso!");
};
