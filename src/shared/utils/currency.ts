/**
 * Converte valor em reais para centavos
 * @param reais - Valor em reais (ex: 150.75)
 * @returns Valor em centavos (ex: 15075)
 */
export const toBRL = (reais: number): number => {
  return Math.round(reais * 100);
};

/**
 * Converte centavos para reais
 * @param cents - Valor em centavos (ex: 15075)
 * @returns Valor em reais (ex: 150.75)
 */
export const fromBRL = (cents: number): number => {
  return cents / 100;
};

/**
 * Formata centavos para exibição em real brasileiro
 * @param cents - Valor em centavos
 * @returns String formatada (ex: "R$ 150,75")
 */
export const formatBRL = (cents: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(fromBRL(cents));
};

/**
 * Soma valores em centavos com segurança
 */
export const sumCents = (...values: number[]): number => {
  return values.reduce((acc, val) => acc + val, 0);
};

/**
 * Calcula porcentagem de um valor em centavos
 * @param cents - Valor base em centavos
 * @param percentage - Porcentagem (ex: 15 para 15%)
 * @returns Resultado em centavos
 */
export const percentageOf = (cents: number, percentage: number): number => {
  return Math.round((cents * percentage) / 100);
};

/**
 * Calcula juros simples
 * @param principal - Valor principal em centavos
 * @param rate - Taxa de juros (ex: 0.5 para 0.5% ao mês)
 * @param periods - Número de períodos
 */
export const simpleInterest = (
  principal: number,
  rate: number,
  periods: number
): number => {
  return Math.round(principal * (1 + (rate / 100) * periods));
};

/**
 * Calcula juros compostos
 * @param principal - Valor principal em centavos
 * @param rate - Taxa de juros (ex: 0.5 para 0.5% ao mês)
 * @param periods - Número de períodos
 */
export const compoundInterest = (
  principal: number,
  rate: number,
  periods: number
): number => {
  return Math.round(principal * Math.pow(1 + rate / 100, periods));
};
