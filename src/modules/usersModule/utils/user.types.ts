import { AdminEntity } from '../userEntity/admin.entity';

export interface BuyerResponse {
  buyerId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  location: { latitude: number; longitude: number };
  email: string;
  role: string;
  isAdmin: boolean;
  userId: string;
}

export interface BuyerCredentials {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  role: string;
  isAdmin: boolean;
  address: string;
  location: { latitude: number; longitude: number };
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

export interface DealerResponse {
  dealerId: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  location: { latitude: number; longitude: number };
  role: string;
  isAdmin: boolean;
  scale: RetailScale;
  rating: number;
  userId: string;
}

export interface DealerCredentials {
  name: string;
  phoneNumber: string;
  address: string;
  location: { latitude: number; longitude: number };
  scale: RetailScale;
  rating: number;
  bankName: string;
  bankCode: string;
  accountNumber: string;
}

export interface DealerResObj {
  dealers: DealerResponse[];
  total: number;
}

export interface buyerResObj {
  buyers: BuyerResponse[];
  total: number;
}

export interface UpdateCredentials {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  location: { latitude: number; longitude: number };
  scale: RetailScale;
}

export enum VehicleType {
  tricycle = 'tricycle',
  truck = 'truck',
  van = 'van',
}

export interface DriverResponse {
  driverId: string;

  firstName: string;

  lastName: string;

  phoneNumber: string;

  email: string;

  address: string;

  vehicle: VehicleType;

  vehicleNumber: string;

  role: string;

  driversLicense: string;

  imageUrl: string;

  isAdmin: boolean;

  userId: string;
}

export interface CreateDriverCredentials {
  firstName: string;

  lastName: string;

  address: string;

  vehicle: VehicleType;

  vehicleNumber: string;

  driversLicenseNumber: string;

  driversLicense: Express.Multer.File;

  file: Express.Multer.File;
}

export interface driverResObj {
  drivers: DriverResponse[];
  total: number;
}

export interface UpdateDriverCredentials {
  firstName?: string;

  lastName?: string;

  phoneNumber?: string;

  email?: string;

  address?: string;

  vehicle?: VehicleType;

  vehicleNumber?: string;

  driversLicense?: Express.Multer.File;
}

export interface AdminResponse {
  admins: AdminEntity[];
  total: number;
}
