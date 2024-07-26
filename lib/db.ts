/**
 * Initializes a Prisma client instance and makes it available globally.
 * 
 * The Prisma client is used to interact with the application's database.
 * This code ensures that there is only a single instance of the Prisma client
 * available throughout the application, which helps to optimize performance
 * and resource usage.
 * 
 * If the application is running in a non-production environment (e.g. development),
 * the Prisma client instance is also stored in the global scope for easier access.
 */


import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db
}
