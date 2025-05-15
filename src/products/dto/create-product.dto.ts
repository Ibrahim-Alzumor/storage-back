export class CreateProductDto {
  id: number;
  name: string;
  stock: number;
  category: string;
  image?: string;
  description?: string;
}
