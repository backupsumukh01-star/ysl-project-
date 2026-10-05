import { get } from "node:https";

const geoCache = new Map<string, { at: number; iso: string }>();

function getText(url: string) {
  return new Promise<string>((resolve, reject) => {
    const req = get(url, { headers: { "Accept-Encoding": "identity", "User-Agent": "RougeSurMesure" } }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
    req.setTimeout(4000, () => {
      req.destroy();
      reject(new Error("timeout"));
    });
    req.on("error", reject);
  });
}

function publicIp(value: string) {
  const ip = value.trim().replace(/^::ffff:/i, "");
  if (!ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("169.254.")) return "";
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return "";
  return ip;
}

function headerCountry(head: Headers) {
  const marked = (head.get("cf-ipcountry") || head.get("x-vercel-ip-country") || "").toUpperCase();
  if (/^[A-Z]{2}$/.test(marked) && marked !== "XX" && marked !== "T1") return marked;
  return "";
}

async function lookupSelf() {
  const text = await getText("https://www.cloudflare.com/cdn-cgi/trace");
  return text.match(/loc=([A-Z]{2})/)?.[1] || "";
}

async function lookupIp(ip: string) {
  const text = await getText(`https://ipwho.is/${encodeURIComponent(ip)}`);
  const body = JSON.parse(text) as { success?: boolean; country_code?: string };
  if (body.success === false) return "";
  const iso = (body.country_code || "").toUpperCase();
  return /^[A-Z]{2}$/.test(iso) ? iso : "";
}

async function lookup(ip: string) {
  const key = ip || "self";
  const hit = geoCache.get(key);
  if (hit && Date.now() - hit.at < 6 * 60 * 60 * 1000) return hit.iso;
  try {
    const iso = ip ? await lookupIp(ip) : await lookupSelf();
    if (iso) geoCache.set(key, { at: Date.now(), iso });
    return iso;
  } catch {
    return "";
  }
}

/** Country the request was opened from. A saved choice is handled by the caller. */
export async function countryFromRequest(head: Headers) {
  const marked = headerCountry(head);
  if (marked) return marked;
  const forwarded = (head.get("x-forwarded-for") || "").split(",")[0] || head.get("x-real-ip") || "";
  return lookup(publicIp(forwarded));
}
