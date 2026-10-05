import { z } from "zod";

export const emailField = z.string().trim().toLowerCase().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email.");
const required = (label: string) => z.string().trim().min(1, `Enter ${label}.`).max(200);

export const addressSchema = z.object({
  name: required("a name"),
  email: emailField,
  phone: z.string().trim().min(6, "Enter a valid phone.").max(30),
  line1: required("a street address"),
  line2: z.string().trim().max(200).optional(),
  city: required("a city"),
  region: required("a state"),
  postcode: required("a postcode"),
  country: required("a country"),
});

export const lineSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).max(10),
  selection: z.string().trim().max(120).optional(),
});

const attributionSchema = z.object({
  firstTouchSource: z.string().max(120).optional(),
  firstTouchMedium: z.string().max(120).optional(),
  firstTouchCampaign: z.string().max(120).optional(),
  lastTouchSource: z.string().max(120).optional(),
  lastTouchMedium: z.string().max(120).optional(),
  lastTouchCampaign: z.string().max(120).optional(),
  term: z.string().max(120).optional(),
  content: z.string().max(200).optional(),
  fbclid: z.string().max(200).optional(),
  fbp: z.string().max(120).optional(),
  fbc: z.string().max(250).optional(),
  landingPage: z.string().max(300).optional(),
  referrer: z.string().max(300).optional(),
});

export const checkoutSchema = z.object({
  lines: z.array(lineSchema).min(1).max(20),
  address: addressSchema,
  couponCode: z.string().trim().max(40).optional(),
  idempotencyKey: z.string().trim().min(8).max(80),
  attribution: attributionSchema.optional(),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
