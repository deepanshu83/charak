export interface Product {
  slug: string;
  name: string;
  category: string;
  price: string;
  summary: string;
  description: string;
  image: string;
  tags: string[];
}

export const products: Product[] = [];
