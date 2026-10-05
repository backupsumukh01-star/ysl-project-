import { fail } from "@/lib/http";
import { getAdmin } from "@/lib/auth";

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) return { admin: null, response: fail("UNAUTHORIZED", "Admin sign-in is required.", 401) };
  return { admin, response: null };
}
