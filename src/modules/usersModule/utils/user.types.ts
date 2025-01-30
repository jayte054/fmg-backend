export interface BuyerResponse {
  buyerId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  location: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

export interface BuyerCredentials {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: string;
  isAdmin: boolean;
  address: string;
  location: string;
}

export interface Usertype {
  id: string;
  email: string;
  isAdmin: boolean;
  phoneNumber: string;
  role: string;
  iat: any;
  exp: any;
}

export enum RetailScale {
  Bulk = 'Bulk-Scale',
  Large = 'Large-Scale',
  Medium = 'Medium-Scale',
  Small = 'Small-Scale',
}

export interface SellerResponse {
  sellerId: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  location: string;
  role: string;
  isAdmin: boolean;
  scale: string;
  rating: number;
  userId: string;
}

export interface SellerCredentials {
  name: string;
  phoneNumber: string;
  address: string;
  location: string;
  scale: RetailScale;
  rating: number;
}

export interface sellerResObj {
  sellers: SellerResponse[];
  total: number;
}

export interface buyerResObj {
  buyers: BuyerResponse[];
  total: number;
}
