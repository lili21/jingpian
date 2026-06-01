import { cache } from "react";
import { headers } from "next/headers";

import { auth, ensureAuthDatabase } from "@/lib/auth";

export const getServerSession = cache(async () => {
  await ensureAuthDatabase();

  return auth.api.getSession({
    headers: await headers(),
  });
});
