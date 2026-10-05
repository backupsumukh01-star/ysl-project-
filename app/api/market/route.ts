import { headers } from "next/headers";
import { ok } from "@/lib/http";
import { marketFor, placeFor } from "@/lib/fx";
import { countryFromRequest } from "@/lib/visitor-country";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("country") || "";
  const country = requested || (await countryFromRequest(await headers()));
  const place = placeFor(country);
  const market = await marketFor(place.iso || country);
  return ok({ ...market, country: place.iso });
}
