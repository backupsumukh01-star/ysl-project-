import { City, Country, State } from "country-state-city";
import { fail, ok } from "@/lib/http";

export const dynamic = "force-dynamic";

type CountryRow = { iso: string; name: string; dial: string };
type StateRow = { iso: string; name: string };

let countries: CountryRow[] | null = null;

function dialCode(raw: string) {
  const text = raw.trim();
  return text.startsWith("+") ? text : `+${text}`;
}

function countryList() {
  if (!countries) {
    countries = Country.getAllCountries()
      .map((item) => ({ iso: item.isoCode, name: item.name, dial: dialCode(item.phonecode) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  return countries;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  if (kind === "countries") return ok(countryList());

  const country = (url.searchParams.get("country") || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) return fail("VALIDATION", "Choose a country.");

  if (kind === "states") {
    const states: StateRow[] = State.getStatesOfCountry(country)
      .map((item) => ({ iso: item.isoCode, name: item.name }))
      .filter((item) => item.iso && item.name)
      .sort((a, b) => a.name.localeCompare(b.name));
    return ok(states);
  }

  if (kind === "cities") {
    const state = url.searchParams.get("state") || "";
    if (!/^[A-Za-z0-9-]{1,12}$/.test(state)) return fail("VALIDATION", "Choose a region.");
    const cities = [...new Set(City.getCitiesOfState(country, state).map((item) => item.name).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
    return ok(cities);
  }

  return fail("VALIDATION", "Unknown place list.");
}
