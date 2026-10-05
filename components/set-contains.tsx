import Image from "next/image";
import { product } from "@/lib/product";
import { trioImageFiles, trioLook, trioPhotoSrc, type TrioFamilyName } from "@/lib/trio-images";

const families = new Set<string>(Object.keys(trioImageFiles));

export function chosenTrios(value: string): TrioFamilyName[] {
  return value
    .split(" · ")
    .map((part) => part.trim())
    .filter((part): part is TrioFamilyName => families.has(part));
}

export function SetContains({ trios, quantity = 1, bare = false }: { trios: TrioFamilyName[]; quantity?: number; bare?: boolean }) {
  if (trios.length !== 3) return null;
  const count = Math.max(1, quantity);

  return (
    <section className="set-contains" aria-label="This set contains">
      {bare ? null : (
        <header>
          <h3>This set contains</h3>
          <p>4 products</p>
        </header>
      )}
      <ul>
        <li>
          <Image src={product.images.hero.src} alt="" width={72} height={96} sizes="72px" />
          <div>
            <strong>{product.name}</strong>
            <p>{product.shortDescription}</p>
            <p>Quantity: {count}</p>
            <p>Device</p>
          </div>
        </li>
        {trios.map((family, index) => (
          <li key={`${family}-${index}`}>
            <Image src={trioPhotoSrc(family)} alt="" width={72} height={72} sizes="72px" />
            <div>
              <strong>Cartridge trio</strong>
              <p>{trioLook[family]}</p>
              <p>Quantity: {count}</p>
              <p>{family}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
