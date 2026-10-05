type QrModule = {
  toString: (text: string, options: Record<string, unknown>) => Promise<string>;
};

export type AppDownloadLinks = {
  APP_STORE_URL: string;
  GOOGLE_PLAY_URL: string;
  appStoreQr: string;
  googlePlayQr: string;
};

export const APP_STORE_URL = "https://apps.apple.com/in/app/ysl-rouge-sur-mesure/id1568732752";
export const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.loreal.ysl.perso.lips";

async function qrSvg(url: string) {
  const loaded = await import("qrcode");
  const QRCode = ((loaded as { default?: QrModule }).default ?? loaded) as QrModule;
  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 4,
    errorCorrectionLevel: "Q",
    color: { dark: "#161616", light: "#f3eee5" },
  });
  return svg.replace(/^\s*<\?xml[^>]*>\s*/i, "");
}

export async function appDownloadLinks(): Promise<AppDownloadLinks> {
  try {
    const [appStoreQr, googlePlayQr] = await Promise.all([
      qrSvg(APP_STORE_URL),
      qrSvg(GOOGLE_PLAY_URL),
    ]);
    return { APP_STORE_URL, GOOGLE_PLAY_URL, appStoreQr, googlePlayQr };
  } catch {
    return { APP_STORE_URL, GOOGLE_PLAY_URL, appStoreQr: "", googlePlayQr: "" };
  }
}
