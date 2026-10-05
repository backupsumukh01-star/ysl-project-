"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { api } from "@/lib/api-client";
import { rememberCountry } from "@/components/market";

type CountryRow = { iso: string; name: string; dial: string };
type StateRow = { iso: string; name: string };
type Option = { id: string; label: string; hint?: string };
type FieldKey = "region" | "city" | "postal";

export type SavedCheckoutDetails = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postcode: string;
  country: string;
};

function countryMatch(rows: CountryRow[], country: string) {
  const wanted = country.trim().toLowerCase();
  if (!wanted) return undefined;
  return rows.find((row) => row.iso.toLowerCase() === wanted || row.name.toLowerCase() === wanted);
}

function splitSavedPhone(phone: string, rows: CountryRow[], preferIso: string) {
  const compact = phone.replace(/\s/g, "");
  const preferred = rows.find((row) => row.iso === preferIso);
  if (preferred && compact.startsWith(preferred.dial)) {
    return { dialIso: preferred.iso, national: compact.slice(preferred.dial.length).replace(/\D/g, "").slice(0, 15) };
  }
  const match = [...rows].sort((a, b) => b.dial.length - a.dial.length).find((row) => row.dial && compact.startsWith(row.dial));
  if (!match) return { dialIso: preferIso, national: compact.replace(/\D/g, "").slice(0, 15) };
  return { dialIso: match.iso, national: compact.slice(match.dial.length).replace(/\D/g, "").slice(0, 15) };
}

const EUROPE = new Set(["DE", "FR", "IT", "ES", "NL", "BE", "AT", "CH", "SE", "NO", "DK", "FI", "PT", "PL", "CZ", "HU", "GR", "RO", "IE"]);

function remainingFields(order: FieldKey[], fields: Record<FieldKey, ReactNode>) {
  const nodes: ReactNode[] = [];
  for (let index = 0; index < order.length; index += 1) {
    const key = order[index];
    if (key === "region" && order[index + 1] === "city") {
      nodes.push(
        <div className="pay-split" key="region-city">
          {fields.region}
          {fields.city}
        </div>,
      );
      index += 1;
    } else {
      nodes.push(fields[key]);
    }
  }
  return nodes;
}

function addressLayout(iso: string) {
  if (iso === "IN") return { region: "State", city: "City", postal: "PIN code", order: ["region", "city", "postal"] as FieldKey[] };
  if (iso === "US") return { region: "State", city: "City", postal: "ZIP code", order: ["region", "city", "postal"] as FieldKey[] };
  if (iso === "CA") return { region: "Province", city: "City", postal: "Postal code", order: ["region", "city", "postal"] as FieldKey[] };
  if (iso === "AU") return { region: "State", city: "Suburb", postal: "Postcode", order: ["region", "city", "postal"] as FieldKey[] };
  if (iso === "GB") return { region: "County", city: "Town", postal: "Postcode", order: ["region", "city", "postal"] as FieldKey[] };
  if (iso === "JP") return { region: "Prefecture", city: "City", postal: "Postal code", order: ["postal", "region", "city"] as FieldKey[] };
  if (iso === "CN" || iso === "KR") return { region: "Province", city: "City", postal: "Postal code", order: ["postal", "region", "city"] as FieldKey[] };
  if (iso === "AE") return { region: "Emirate", city: "City", postal: "Postal code", order: ["region", "city", "postal"] as FieldKey[] };
  if (EUROPE.has(iso)) return { region: "Region", city: "City", postal: "Postal code", order: ["region", "city", "postal"] as FieldKey[] };
  return { region: "Region", city: "City", postal: "Postal code", order: ["region", "city", "postal"] as FieldKey[] };
}

export function CheckoutAddress({
  defaultCountry,
  coupon,
  onCoupon,
  shippingMessage,
  shippingEstimate,
  couponNotice,
  onCountry,
  savedAddresses = [],
  savedFrom = "account",
  contact,
  detailsReady = false,
}: {
  defaultCountry: string;
  coupon: string;
  onCoupon: (value: string) => void;
  shippingMessage: string;
  shippingEstimate?: string;
  couponNotice?: string;
  onCountry?: (country: string, iso: string) => void;
  savedAddresses?: SavedCheckoutDetails[];
  savedFrom?: "account" | "device";
  contact?: { name: string; phone: string };
  detailsReady?: boolean;
}) {
  const [countries, setCountries] = useState<CountryRow[] | null>(null);
  const [countryIso, setCountryIso] = useState("");
  const [dialIso, setDialIso] = useState("");
  const [dialTouched, setDialTouched] = useState(false);
  const [national, setNational] = useState("");
  const [states, setStates] = useState<StateRow[] | null>(null);
  const [statesFor, setStatesFor] = useState("");
  const [regionIso, setRegionIso] = useState("");
  const [regionText, setRegionText] = useState("");
  const [cities, setCities] = useState<string[] | null>(null);
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [street2, setStreet2] = useState("");
  const [postal, setPostal] = useState("");
  const [recipient, setRecipient] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [addressChoice, setAddressChoice] = useState("0");
  const filled = useRef(false);
  const pendingRegion = useRef<{ region: string; country: string } | null>(null);

  useEffect(() => {
    let cancel = false;
    api<CountryRow[]>("/api/places?kind=countries")
      .then((rows) => {
        if (cancel) return;
        setCountries(rows);
        const preferred = defaultCountry.trim().toLowerCase();
        const match =
          rows.find((row) => row.iso.toLowerCase() === preferred) ||
          rows.find((row) => row.name.toLowerCase() === preferred) ||
          rows.find((row) => row.iso === "US") ||
          rows[0];
        if (match) {
          setCountryIso(match.iso);
          setDialIso(match.iso);
        }
      })
      .catch(() => {
        if (!cancel) setCountries([]);
      });
    return () => {
      cancel = true;
    };
  }, [defaultCountry]);

  useEffect(() => {
    if (!countryIso) return;
    let cancel = false;
    setStates(null);
    setStatesFor("");
    api<StateRow[]>(`/api/places?kind=states&country=${countryIso}`)
      .then((rows) => {
        if (cancel) return;
        setStates(rows);
        setStatesFor(countryIso);
      })
      .catch(() => {
        if (cancel) return;
        setStates([]);
        setStatesFor(countryIso);
      });
    return () => {
      cancel = true;
    };
  }, [countryIso]);

  useEffect(() => {
    if (!countryIso || !regionIso) {
      setCities(null);
      return;
    }
    let cancel = false;
    setCities(null);
    api<string[]>(`/api/places?kind=cities&country=${countryIso}&state=${encodeURIComponent(regionIso)}`)
      .then((rows) => {
        if (!cancel) setCities(rows);
      })
      .catch(() => {
        if (!cancel) setCities([]);
      });
    return () => {
      cancel = true;
    };
  }, [countryIso, regionIso]);

  useEffect(() => {
    if (filled.current || !detailsReady || !countries?.length) return;
    const first = savedAddresses[0];
    if (!first && !contact?.name && !contact?.phone) return;
    filled.current = true;
    if (first) {
      fillSaved(first, countries);
      return;
    }
    if (contact?.name) setRecipient(contact.name);
    if (contact?.phone) {
      const phone = splitSavedPhone(contact.phone, countries, countryIso);
      setDialIso(phone.dialIso);
      setDialTouched(true);
      setNational(phone.national);
    }
  }, [countries, savedAddresses, contact, countryIso, detailsReady]);

  const country = countries?.find((row) => row.iso === countryIso);

  useEffect(() => {
    if (!country) return;
    rememberCountry(country.iso, country.name);
    onCountry?.(country.name, country.iso);
  }, [country, onCountry]);

  useEffect(() => {
    const next = pendingRegion.current;
    if (!next || !states || statesFor !== countryIso || !country) return;
    const same =
      country.name.toLowerCase() === next.country.trim().toLowerCase() ||
      country.iso.toLowerCase() === next.country.trim().toLowerCase();
    if (!same) return;
    pendingRegion.current = null;
    if (!states.length) return;
    const match = states.find(
      (row) => row.name.toLowerCase() === next.region.trim().toLowerCase() || row.iso.toLowerCase() === next.region.trim().toLowerCase(),
    );
    if (match) {
      setRegionIso(match.iso);
      setRegionText(match.name);
    }
  }, [states, statesFor, countryIso, country]);
  const dial = countries?.find((row) => row.iso === dialIso);
  const layout = addressLayout(countryIso || "US");
  const regionName = states?.length
    ? states.find((row) => row.iso === regionIso)?.name || regionText
    : regionText || country?.name || "";
  const phone = `${dial?.dial || ""}${national}`.slice(0, 30);
  const listedCities = cities ?? [];
  const cityIsList = listedCities.length > 0;
  const regionIsList = (states?.length || 0) > 0;
  const cityLocked = states === null || (regionIsList && !regionIso && !regionText) || (Boolean(regionIso) && cities === null);

  function fillSaved(details: SavedCheckoutDetails, rows: CountryRow[]) {
    if (details.name) setRecipient(details.name);
    setStreet(details.line1);
    setStreet2(details.line2);
    setPostal(details.postcode);
    setCity(details.city);
    setRegionIso("");
    setRegionText(details.region);
    const match = countryMatch(rows, details.country);
    const countryName = match?.name || details.country;
    pendingRegion.current = details.region ? { region: details.region, country: countryName } : null;
    if (details.region && match && statesFor === match.iso && states?.length) {
      const region = states.find(
        (row) => row.name.toLowerCase() === details.region.trim().toLowerCase() || row.iso.toLowerCase() === details.region.trim().toLowerCase(),
      );
      if (region) {
        setRegionIso(region.iso);
        setRegionText(region.name);
        pendingRegion.current = null;
      }
    }
    if (match) {
      setCountryIso(match.iso);
      if (details.phone) {
        const phone = splitSavedPhone(details.phone, rows, match.iso);
        setDialIso(phone.dialIso);
        setDialTouched(true);
        setNational(phone.national);
      } else if (!dialTouched) {
        setDialIso(match.iso);
      }
    } else if (details.phone) {
      const phone = splitSavedPhone(details.phone, rows, countryIso);
      setDialIso(phone.dialIso);
      setDialTouched(true);
      setNational(phone.national);
    }
  }

  function chooseCountry(iso: string) {
    pendingRegion.current = null;
    setCountryIso(iso);
    if (!dialTouched) setDialIso(iso);
    setRegionIso("");
    setRegionText("");
    setCity("");
    setOpen(null);
  }

  function chooseSaved(value: string) {
    setAddressChoice(value);
    if (!countries) return;
    if (value === "new") {
      pendingRegion.current = null;
      setStreet("");
      setStreet2("");
      setPostal("");
      setCity("");
      setRegionIso("");
      setRegionText("");
      return;
    }
    const details = savedAddresses[Number(value)];
    if (details) fillSaved(details, countries);
  }

  function chooseRegion(iso: string, name: string) {
    setRegionIso(iso);
    setRegionText(name);
    setCity("");
    setOpen(null);
  }

  const fields: Record<FieldKey, ReactNode> = {
    postal: (
      <TextField key="postal" label={layout.postal} name="postcode" autoComplete="postal-code" value={postal} onChange={setPostal} />
    ),
    region: regionIsList ? (
      <Picker
        key="region"
        label={layout.region}
        placeholder={`Select a ${layout.region.toLowerCase()}`}
        value={regionName}
        selectedId={regionIso}
        open={open === "region"}
        query={query}
        onQuery={setQuery}
        onOpen={() => {
          setQuery("");
          setOpen("region");
        }}
        onClose={() => setOpen(null)}
        options={(states || []).map((row) => ({ id: row.iso, label: row.name }))}
        onSelect={(option) => chooseRegion(option.id, option.label)}
        allowCustom
        onCustom={(name) => chooseRegion("", name)}
      />
    ) : (
      <TextField key="region" label={layout.region} value={regionText} onChange={setRegionText} placeholder={states === null ? "Loading" : ""} disabled={states === null} />
    ),
    city: cityIsList ? (
      <Picker
        key="city"
        label={layout.city}
        placeholder={`Select a ${layout.city.toLowerCase()}`}
        value={city}
        selectedId={city}
        open={open === "city"}
        query={query}
        onQuery={setQuery}
        onOpen={() => {
          setQuery("");
          setOpen("city");
        }}
        onClose={() => setOpen(null)}
        options={listedCities.map((name) => ({ id: name, label: name }))}
        onSelect={(option) => {
          setCity(option.label);
          setOpen(null);
        }}
        allowCustom
        onCustom={(name) => {
          setCity(name);
          setOpen(null);
        }}
      />
    ) : (
      <TextField
        key="city"
        label={layout.city}
        name={!cityLocked ? "city" : undefined}
        autoComplete="address-level2"
        value={cityLocked ? "" : city}
        onChange={setCity}
        placeholder={
          states === null || (regionIso && cities === null)
            ? "Loading"
            : regionIsList && !regionIso && !regionText
              ? `Select a ${layout.region.toLowerCase()} first`
              : ""
        }
        disabled={cityLocked}
      />
    ),
  };

  return (
    <>
      <div className="field">
        <span>Contact number</span>
        <div className="pay-phone">
          <Picker
            bare
            label="Country code"
            placeholder="Code"
            value={dial?.dial || ""}
            selectedId={dialIso}
            open={open === "dial"}
            query={query}
            onQuery={setQuery}
            onOpen={() => {
              setQuery("");
              setOpen("dial");
            }}
            onClose={() => setOpen(null)}
            options={(countries || []).map((row) => ({ id: row.iso, label: row.name, hint: row.dial }))}
            onSelect={(option) => {
              setDialTouched(true);
              setDialIso(option.id);
              setOpen(null);
            }}
          />
          <input
            value={national}
            onChange={(event) => setNational(event.target.value.replace(/[^\d]/g, "").slice(0, 15))}
            inputMode="tel"
            autoComplete="tel-national"
            aria-label="Contact number"
            required
          />
        </div>
      </div>
      <h2>Shipping address</h2>
      {savedAddresses.length ? (
        <label className="field">
          <span>Saved address</span>
          <select value={addressChoice} onChange={(event) => chooseSaved(event.target.value)}>
            {savedAddresses.map((address, index) => (
              <option key={`${address.line1}-${address.postcode}-${index}`} value={String(index)}>
                {[address.line1, address.city, address.country].filter(Boolean).join(", ")}
              </option>
            ))}
            <option value="new">Add a new address</option>
          </select>
        </label>
      ) : null}
      {savedAddresses.length && addressChoice !== "new" ? (
        <p className="muted">
          {savedFrom === "device"
            ? "Filled from your last order on this device. Change any field, or add a new address."
            : "Filled from your account. Change any field, or add a new address."}
        </p>
      ) : null}
      <TextField label="Full name" name="name" autoComplete="name" value={recipient} onChange={setRecipient} />
      <TextField label="Address line 1" name="address" autoComplete="address-line1" value={street} onChange={setStreet} />
      <TextField label="Address line 2" name="address2" autoComplete="address-line2" value={street2} onChange={setStreet2} optional />
      <Picker
        label="Country"
        placeholder={countries === null ? "Loading countries" : "Select a country"}
        value={country?.name || ""}
        selectedId={countryIso}
        open={open === "country"}
        query={query}
        onQuery={setQuery}
        onOpen={() => {
          setQuery("");
          setOpen("country");
        }}
        onClose={() => setOpen(null)}
        options={(countries || []).map((row) => ({ id: row.iso, label: row.name, hint: row.dial }))}
        onSelect={(option) => chooseCountry(option.id)}
      />
      {remainingFields(layout.order, fields)}
      <h2 className="pay-quiet">Delivery</h2>
      <p className="pay-reassure">{shippingMessage}</p>
      {shippingEstimate ? <p className="muted">{shippingEstimate}</p> : null}
      <label className="field pay-promo">
        <span className="pay-label-row">
          <span>Promo code</span>
          <em>Optional</em>
        </span>
        <input value={coupon} onChange={(event) => onCoupon(event.target.value)} autoComplete="off" />
      </label>
      {couponNotice ? <p className="notice">{couponNotice}</p> : null}
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="country" value={country?.name || ""} />
      <input type="hidden" name="state" value={regionName} />
      {cityIsList ? <input type="hidden" name="city" value={city} /> : null}
    </>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  autoComplete,
  placeholder,
  disabled = false,
  optional = false,
}: {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="field">
      {optional ? (
        <span className="pay-label-row">
          <span>{label}</span>
          <em>Optional</em>
        </span>
      ) : (
        <span>{label}</span>
      )}
      <input
        name={name}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        required={!disabled && !optional}
        disabled={disabled}
      />
    </label>
  );
}

function Picker({
  label,
  placeholder,
  value,
  selectedId,
  options,
  open,
  query,
  onQuery,
  onOpen,
  onClose,
  onSelect,
  allowCustom = false,
  onCustom,
  bare = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  selectedId?: string;
  options: Option[];
  open: boolean;
  query: string;
  onQuery: (value: string) => void;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (option: Option) => void;
  allowCustom?: boolean;
  onCustom?: (value: string) => void;
  bare?: boolean;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const needle = query.trim().toLowerCase();
  const shown = needle
    ? options.filter((option) => `${option.label} ${option.hint || ""}`.toLowerCase().includes(needle))
    : options;
  const exact = shown.some((option) => option.label.toLowerCase() === needle);
  const chosen = (option: Option) => option.id === selectedId;

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) closeRef.current();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeRef.current();
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const control = (
    <div className="pay-place" ref={rootRef}>
      <button
        type="button"
        className={value ? "pay-place__button" : "pay-place__button is-empty"}
        aria-label={bare ? label : undefined}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? onClose() : onOpen())}
      >
        <span>{value || placeholder}</span>
        <Chevron />
      </button>
      {open ? (
        <div className="pay-place__panel">
          <input
            ref={searchRef}
            value={query}
            placeholder="Search"
            aria-label={`Search ${label.toLowerCase()}`}
            onChange={(event) => onQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              if (shown.length === 1) onSelect(shown[0]);
              else if (allowCustom && needle && !exact) onCustom?.(query.trim());
            }}
          />
          <ul id={listId} className="pay-place__list" role="listbox">
            {allowCustom && needle && !exact ? (
              <li>
                <button type="button" onClick={() => onCustom?.(query.trim())}>
                  Use “{query.trim()}”
                </button>
              </li>
            ) : null}
            {shown.map((option) => (
              <li key={option.id}>
                <button type="button" role="option" aria-selected={chosen(option)} className={chosen(option) ? "is-on" : undefined} onClick={() => onSelect(option)}>
                  <span>{option.label}</span>
                  {option.hint ? <em>{option.hint}</em> : null}
                </button>
              </li>
            ))}
            {!shown.length && !(allowCustom && needle) ? (
              <li className="pay-place__empty">No matches</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );

  if (bare) return control;
  return (
    <div className="field">
      <span>{label}</span>
      {control}
    </div>
  );
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
