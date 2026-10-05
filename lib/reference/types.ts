export type RefImage = { src: string; alt: string };

export type RefVariant = { id: string; name: string; sku: string; price: number | null };

export type RefOffer = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number | null;
  sku: string;
  type: string;
  inStock: boolean;
  availability: string;
  included: string;
  images: RefImage[];
  variants: RefVariant[];
};
