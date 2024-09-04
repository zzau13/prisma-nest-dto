import { IsOptional } from 'class-validator';
import { Prisma } from '@prisma/client';

export class UpdateProductDto {
  name?: string;
  description?: string;
  images?: Prisma.JsonValue[];
  @IsOptional()
  highlighted?: boolean | null;
  @IsOptional()
  reviewCount?: number | null;
  @IsOptional()
  attributes?: Prisma.JsonValue | null;
  @IsOptional()
  score?: number | null;
}
