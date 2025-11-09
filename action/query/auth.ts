import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

const cachedSession = cache(async (headerEntries: [string, string][]) => {
  return auth.api.getSession({
    headers: Object.fromEntries(headerEntries),
  });
});

export async function getSession() {
  const headerEntries = Array.from(headers().entries());
  return cachedSession(headerEntries);
}
