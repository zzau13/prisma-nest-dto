import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IntersectionType } from '@nestjs/swagger';
import { Product } from './product.entity';

export class Category {
  id: string;
}
export class CategoryRel {
  @Type(() => Product)
  @ValidateNested()
  Product: Product[];
}
export class CategoryFull extends IntersectionType(Category, CategoryRel) {}
