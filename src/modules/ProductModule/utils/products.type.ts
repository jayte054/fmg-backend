import { RetailScale } from 'src/modules/usersModule/utils/user.types';

export interface DriverDetails {
  driverId: string;
  driverName: string;
  driverEmail: string;
  driverPhoneNumber: number;
}

// export interface DriversArray {
//   driver: DriverDetails;
// }

export interface Reviewers {
  name: string;
  review: string;
  rating: number;
}

export interface ProductResponse {
  productId: string;
  providerName: string;
  phoneNumber: string;
  scale: RetailScale;
  pricePerKg: number;
  rating: number;
  address: string;
  location: string;
  linkedDrivers: DriverDetails[];
  reviews: Reviewers[];
  purchases: number;
  dealerId: string;
}

export interface CreateProductCredentials {
  pricePerKg: number;
}

export interface productResObj {
  products: ProductResponse[];
  total: number;
}

export interface UpdateProductCredentials {
  providerName?: string;
  phoneNumber?: string;
  scale?: RetailScale;
  pricePerKg?: number;
  address?: string;
  location?: string;
}

export interface AddDriverCredential {
  driverId: string;
  driverName: string;
  driverEmail: string;
  driverPhoneNumber: number;
}
