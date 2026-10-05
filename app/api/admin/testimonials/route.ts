import { z } from "zod";
import { fail, guardOrigin, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(120),
  location: z.string().max(120).optional(),
  image: z.string().max(300).optional(),
  quote: z.string().trim().min(1).max(1000),
  rating: z.number().int().min(1).max(5).optional(),
  productId: z.string().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return ok({ testimonials: [] });
  const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  return ok({ testimonials });
}

export async function POST(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Testimonials are not available.", 503);
  const body = schema.safeParse(await readJson(request));
  if (!body.success) return fail("VALIDATION", "Check the testimonial.");
  if (body.data.id) {
    const row = await prisma.testimonial.update({
      where: { id: body.data.id },
      data: {
        name: body.data.name,
        location: body.data.location || "",
        image: body.data.image || "",
        quote: body.data.quote,
        rating: body.data.rating ?? 5,
        productId: body.data.productId || "",
        published: body.data.published ?? false,
        sortOrder: body.data.sortOrder ?? 0,
      },
    });
    return ok({ id: row.id });
  }
  const row = await prisma.testimonial.create({
    data: {
      name: body.data.name,
      location: body.data.location || "",
      image: body.data.image || "",
      quote: body.data.quote,
      rating: body.data.rating ?? 5,
      productId: body.data.productId || "",
      published: false,
      sortOrder: body.data.sortOrder ?? 0,
    },
  });
  return ok({ id: row.id });
}

export async function DELETE(request: Request) {
  const blocked = guardOrigin(request);
  if (blocked) return blocked;
  const guard = await requireAdmin();
  if (guard.response) return guard.response;
  const prisma = db();
  if (!prisma) return fail("DATABASE_UNAVAILABLE", "Testimonials are not available.", 503);
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!id) return fail("VALIDATION", "Missing testimonial.");
  await prisma.testimonial.delete({ where: { id } });
  return ok({ deleted: true });
}
