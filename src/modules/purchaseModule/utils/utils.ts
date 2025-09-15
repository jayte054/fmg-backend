import { BadRequestException } from '@nestjs/common';
import { CylinderType, PriceType, PurchaseType } from './purchase.type';

export const validatePurchaseTypes = (
  purchaseType: string,
  priceType: string,
  cylinderType?: string,
) => {
  const enumValidationMap = [
    { value: purchaseType, enum: PurchaseType, name: 'purchaseType' },
    { value: cylinderType, enum: CylinderType, name: 'cylinderType' },
    { value: priceType, enum: PriceType, name: 'priceType' },
  ];

  for (const { value, enum: enumType, name } of enumValidationMap) {
    if (!Object.keys(enumType).includes(value)) {
      throw new BadRequestException(`Invalid ${name}: ${value}`);
    }
  }
};
