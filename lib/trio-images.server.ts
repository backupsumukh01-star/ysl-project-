import fs from "node:fs";
import path from "node:path";
import { trioImageFiles, trioPhotoSrc, type TrioFamilyName } from "@/lib/trio-images";

export function availableTrioImages(): Partial<Record<TrioFamilyName, string>> {
  const imagesDir = path.join(process.cwd(), "public", "images");
  const ready: Partial<Record<TrioFamilyName, string>> = {};
  for (const name of Object.keys(trioImageFiles) as TrioFamilyName[]) {
    if (fs.existsSync(path.join(imagesDir, trioImageFiles[name]))) ready[name] = trioPhotoSrc(name);
  }
  return ready;
}
