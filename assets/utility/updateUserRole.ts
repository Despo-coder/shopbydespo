// src/utils/updateUserRole.ts
import { clerkClient } from "@clerk/nextjs/server";

export async function updateUserRole(userId: string, role: string) {
  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        publicMetadata: { role: "admin" }
      },
    });
    console.log(`User ${userId} role updated to ${role}`);
  } catch (error) {
    console.error(`Failed to update user ${userId} role:`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    } else {
      throw new Error('Failed to update user role: Unknown error');
    }
  }
}
