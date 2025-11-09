import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

// React cache instance memoizes per serialized headers.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cachedSession = cache(async (headerEntries: [string, string][]) => {
  return auth.api.getSession({
    headers: Object.fromEntries(headerEntries),
  });
});

export const getSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});
