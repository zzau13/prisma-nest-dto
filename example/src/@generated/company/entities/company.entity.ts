import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IntersectionType } from '@nestjs/swagger';
import { Product } from '../../product/entities/product.entity';

export class Company {
  id: string;
}
export class CompanyRel {
  @Type(() => Product)
  @ValidateNested()
  Product: Product[];
}
export class CompanyFull extends IntersectionType(Company, CompanyRel) {}
