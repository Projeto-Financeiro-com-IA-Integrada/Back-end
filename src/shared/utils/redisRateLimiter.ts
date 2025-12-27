import { RedisClientType, createClient } from "redis";

let redisClient: RedisClientType | null = null;

export async function initializeRedis() {
  if (redisClient) return; // Já inicializado

  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });

  redisClient.on("error", (err) => console.error("Redis error:", err));

  try {
    await redisClient.connect();
  } catch (error) {
    throw error;
  }
}

export class RedisRateLimiter {
  static async checkVerificationAttempts(
    email: string
  ): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    message?: string;
  }> {
    if (!redisClient) {
      throw new Error("Redis not initialized");
    }

    const key = `verify:${email}`;
    const blockedKey = `blocked:${email}`;

    // Verifica se está bloqueado
    const isBlocked = await redisClient.get(blockedKey);
    if (isBlocked) {
      const ttl = await redisClient.ttl(blockedKey);
      return {
        allowed: false,
        remainingAttempts: 0,
        message: `Muitas tentativas. Tente novamente em ${Math.ceil(ttl / 60)} minuto(s).`,
      };
    }

    // Obtém número de tentativas
    const attempts = await redisClient.incr(key);

    if (attempts === 1) {
      await redisClient.expire(key, 15 * 60);
    }

    if (attempts >= 6) {
      await redisClient.setEx(blockedKey, 30 * 60, "1");
      return {
        allowed: false,
        remainingAttempts: 0,
        message: "Muitas tentativas. Sua conta foi bloqueada por 30 minutos.",
      };
    }

    return {
      allowed: true,
      remainingAttempts: 5 - attempts,
    };
  }

  static async recordFailedAttempt(email: string): Promise<void> {
    if (!redisClient) {
      throw new Error("Redis not initialized");
    }

    const key = `verify:${email}`;
    await redisClient.incr(key);
  }

  static async resetAttempts(email: string): Promise<void> {
    if (!redisClient) {
      throw new Error("Redis not initialized");
    }

    const key = `verify:${email}`;
    await redisClient.del(key);
  }
}
