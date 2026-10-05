import { guardOrigin, ok } from "@/lib/http";
import { logoutAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  await logoutAdmin();
  return ok({ signedOut: true });
}
