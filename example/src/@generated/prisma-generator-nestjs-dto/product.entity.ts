import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';
import { IntersectionType } from '@nestjs/swagger';
import { Company } from './company.entity';
import { Category } from './category.entity';

export class Product {
  id: string;
  name: string;
  description: string;
  images: Prisma.JsonValue[];
  @IsOptional()
  highlighted: boolean | null;
  @IsOptional()
  reviewCount: number | null;
  @IsOptional()
  attributes: Prisma.JsonValue | null;
  @IsOptional()
  score: number | null;
  categoryId: string;
  companyId: string;
}
export class ProductRel {
  @Type(() => Category)
  @ValidateNested()
  category: Category;
  @Type(() => Company)
  @ValidateNested()
  company: Company;
}
export class ProductFull extends IntersectionType(Product, ProductRel) {}
