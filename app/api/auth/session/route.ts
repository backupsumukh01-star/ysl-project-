import { ok } from "@/lib/http";
import { getCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCustomer();
  if (!user) return ok({ user: null });
  return ok({ user: { id: user.id, email: user.email, name: user.name, phone: user.phone } });
}
