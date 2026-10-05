import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { previewCheckout } from "@/lib/commerce";
import { fromMinor } from "@/lib/fx";
import { lineSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  lines: z.array(lineSchema).max(30),
  couponCode: z.string().max(40).optional(),
  country: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  if (!rateLimit(`quote:${clientIp(request)}`, 60, 10 * 60 * 1000)) {
    return fail("RATE_LIMITED", "Too many checkout attempts. Wait and try again.", 429);
  }
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "Check the items in your bag.");
  const result = await previewCheckout({ lines: parsed.data.lines, couponCode: parsed.data.couponCode, country: parsed.data.country });
  if (!result.ok) return fail(result.code, result.message);
  const preview = result.preview;
  return ok({
    currency: preview.currency,
    lines: preview.lines.map((line) => ({
      productId: line.productId,
      variantId: line.variantId,
      name: line.name,
      variantName: line.variantName,
      quantity: line.quantity,
      unit: fromMinor(line.unitMinor, preview.currency),
    })),
    subtotal: fromMinor(preview.subtotalMinor, preview.currency),
    discount: fromMinor(preview.discountMinor, preview.currency),
    shipping: fromMinor(preview.shippingMinor, preview.currency),
    tax: fromMinor(preview.taxMinor, preview.currency),
    total: fromMinor(preview.totalMinor, preview.currency),
    shippingConfigured: preview.shippingConfigured,
    taxConfigured: preview.taxConfigured,
    shippingEstimate: preview.shippingEstimate,
  });
}
