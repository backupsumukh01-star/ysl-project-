import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { getCustomer } from "@/lib/auth";
import { db } from "@/lib/db";
import { mergeUserCart } from "@/lib/cart-store";
import { lineSchema } from "@/lib/validators";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to save this bag.", 401);
  if (!db()) return fail("DATABASE_UNAVAILABLE", "The bag is not available.", 503);
  const parsed = z.object({ items: z.array(lineSchema).max(20) }).safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "The bag could not be saved.");
  const items = await mergeUserCart(user.id, parsed.data.items);
  return ok({ items });
}
