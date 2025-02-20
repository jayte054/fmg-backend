export enum PurchaseType {
  debut_order = 'debut order',
  cylinder_swap_order = ' cylinder swap order ', //customer swaps cylinder with vendor
  gas_swap_order = 'gas swap order', // swaps cylinder with customer while fulfilling the value of the purchase
  commission_order = 'commission order', // customer's cylinder is picked up filled and returned
}

export enum PriceType {
  cylinder_price = 'Cylinder Price',
  custom_price = 'Custom Price',
}

export enum CylinderType {
  three_kg = '3kg',
  five_kg = '5kg',
  six_kg = '6kg',
  twelve_five_kg = '12.5kg',
  twentyFive_kg = '25kg',
  fifty_kg = '50kg',
}

export interface PurchaseResponse {
  purchaseId: string;

  productId: string;

  price: string;

  priceType: PriceType;

  cylinderType: CylinderType;

  purchaseType: PurchaseType;

  buyerName: string;

  address: string;

  location: string;

  purchaseDate: string;

  buyerId: string;
}

export interface CreatePurchaseCredentials {
  productId: string;

  price: string;

  cylinderType: CylinderType;

  priceType: PriceType;

  purchaseType: PurchaseType;

  address?: string;
}
