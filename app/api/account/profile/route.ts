import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { getCustomer } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/service";
import { orderEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().max(120),
  phone: z.string().trim().max(30),
  marketingEmail: z.boolean().optional(),
});

export async function GET() {
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to view your profile.", 401);
  return ok({ email: user.email, name: user.name, phone: user.phone, marketingEmail: user.marketingEmail });
}

export async function PUT(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const user = await getCustomer();
  if (!user) return fail("UNAUTHORIZED", "Sign in to edit your profile.", 401);
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Profiles are not available.", 503);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return fail("VALIDATION", "Check your profile details.");
  const next = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      ...(parsed.data.marketingEmail == null ? {} : { marketingEmail: parsed.data.marketingEmail }),
    },
  });
  if (parsed.data.phone && parsed.data.phone !== user.phone) {
    await sendEmail({
      to: user.email,
      type: "phone_changed",
      dedupeKey: `phone_changed:${user.id}:${parsed.data.phone}`,
      ...orderEmail({ title: "Phone number updated", number: "", total: "", note: "The phone number on your account was changed. If this was not you, contact support." }),
    });
  }
  return ok({ email: next.email, name: next.name, phone: next.phone, marketingEmail: next.marketingEmail });
}
