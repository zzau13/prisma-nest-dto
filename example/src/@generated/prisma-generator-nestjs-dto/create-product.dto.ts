import { IsOptional, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';
import { ApiExtraModels } from '@nestjs/swagger';
import { ConnectCompanyDto } from './connect-company.dto';
import { ConnectCategoryDto } from './connect-category.dto';
export class CreateProductCategoryRelationInputDto {
  @Type(() => ConnectCategoryDto)
  @ValidateNested()
  connect: ConnectCategoryDto;
}
export class CreateProductCompanyRelationInputDto {
  @Type(() => ConnectCompanyDto)
  @ValidateNested()
  connect: ConnectCompanyDto;
}
@ApiExtraModels(
  ConnectCategoryDto,
  CreateProductCategoryRelationInputDto,
  ConnectCompanyDto,
  CreateProductCompanyRelationInputDto,
)
export class CreateProductDto {
  name: string;
  description: string;
  images: Prisma.InputJsonValue[];
  @IsOptional()
  highlighted?: boolean;
  @IsOptional()
  reviewCount?: number;
  @IsOptional()
  attributes?: Prisma.InputJsonValue;
  @IsOptional()
  score?: number;
  categoryId: string;
  companyId: string;
  @Type(() => Category)
  @ValidateNested()
  category: CreateProductCategoryRelationInputDto;
  @Type(() => Company)
  @ValidateNested()
  company: CreateProductCompanyRelationInputDto;
  @IsDateString()
  createdAt?: Date;
  @IsDateString()
  updatedAt?: Date;
}
