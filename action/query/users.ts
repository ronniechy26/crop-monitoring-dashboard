import { cache } from "react";
import { desc } from "drizzle-orm";

import { user as userTable } from "@/auth-schema";
import { db } from "@/lib/db";
import type { AdminUser } from "@/types/user";

export const getUsers = cache(async (): Promise<AdminUser[]> => {
  return db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      emailVerified: userTable.emailVerified,
      image: userTable.image,
      createdAt: userTable.createdAt,
      updatedAt: userTable.updatedAt,
    })
    .from(userTable)
    .orderBy(desc(userTable.createdAt));
});
