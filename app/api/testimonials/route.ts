import { ok } from "@/lib/http";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const prisma = db();
  if (!prisma) return ok({ testimonials: [] });
  const testimonials = await prisma.testimonial.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });
  return ok({
    testimonials: testimonials.map((item) => ({
      id: item.id,
      name: item.name,
      location: item.location,
      image: item.image,
      quote: item.quote,
      rating: item.rating,
    })),
  });
}
