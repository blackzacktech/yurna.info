import Redis, { type Redis as RedisType } from "ioredis";
import { Logger } from ".././logger";

declare const globalThis: {
  redisGlobal: RedisType | MockRedis;
} & typeof global;

// Mock-Redis-Client für Environments ohne Redis
class MockRedis {
  private static instance: MockRedis;
  private store: Map<string, any> = new Map();

  constructor() {
    Logger("warn", "Using MockRedis client - data will not be persisted!");
  }

  static getInstance(): MockRedis {
    if (!MockRedis.instance) {
      MockRedis.instance = new MockRedis();
    }
    return MockRedis.instance;
  }

  // Implementiere grundlegende Redis-Methoden für Mock
  async get(key: string): Promise<any> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: any): Promise<any> {
    this.store.set(key, value);
    return "OK";
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    return existed ? 1 : 0;
  }

  // Weitere Methoden können nach Bedarf hinzugefügt werden
  on(event: string, callback: (...args: any[]) => void): this {
    // Keine Ereignisse im Mock-Client
    return this;
  }
}

const createRedisClient = () => {
  try {
    if (!process.env.REDIS_URL) {
      Logger("warn", "No Redis URL found! Please set the REDIS_URL environment variable!");

      // Im Entwicklungsmodus können wir versuchen, lokalen Redis zu verwenden
      if (process.env.NODE_ENV === "development") {
        Logger("info", "Trying to connect to local Redis at redis://localhost:6379");
        const client = new Redis("redis://localhost:6379");

        // Füge Event-Handler hinzu, um zur Mock-Implementierung zu wechseln, wenn die Verbindung fehlschlägt
        client.on("error", (err) => {
          Logger("error", `Redis connection error: ${err.message}. Using MockRedis instead.`);
          return MockRedis.getInstance() as any;
        });

        return client;
      }

      // Im Produktions- oder Build-Modus verwenden wir direkt MockRedis
      return MockRedis.getInstance() as any;
    }

    Logger("info", "Creating Redis client using provided REDIS_URL...");
    return new Redis(process.env.REDIS_URL);
  } catch (error) {
    Logger("error", `Failed to create Redis client: ${(error as Error).message}. Using MockRedis instead.`);
    return MockRedis.getInstance() as any;
  }
};

const redisClient = globalThis.redisGlobal ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalThis.redisGlobal = redisClient;

export default redisClient;
