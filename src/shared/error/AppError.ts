export class AppError extends Error {
  public readonly statusCode: number;
  public readonly timestamp: Date;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.timestamp = new Date();

    // Mantém o nome da classe em caso de erro
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serializar erro para resposta JSON
   */
  toJSON() {
    return {
      error: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    };
  }
}
