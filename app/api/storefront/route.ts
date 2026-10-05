import { ok } from "@/lib/http";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok({
    whatsapp: siteConfig.whatsapp,
    supportEmail: siteConfig.supportEmail,
    currency: siteConfig.currency,
  });
}
