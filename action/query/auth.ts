import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

const cachedSession = cache(async (headerEntries: [string, string][]) => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

export const getSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});