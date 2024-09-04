import { IntersectionType } from '@nestjs/swagger';

export class Another {
  id1: string;
  id2: string;
}
export class AnotherRel {}
export class AnotherFull extends IntersectionType(Another, AnotherRel) {}
