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
