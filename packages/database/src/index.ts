// Export the Prisma client instance directly
import prismaClient from './client';

// Named export for prisma
export const prisma = prismaClient;

// Default export for backward compatibility
export default prismaClient;

// Re-export Redis client for convenience
export { default as redisClient } from './redis/client';
