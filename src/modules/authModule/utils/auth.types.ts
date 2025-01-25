export interface SignupResponse {
  id: string;
  email: string;
  phoneNumber: string;
  role: string;
  isAdmin: boolean;
}

export interface SigninResponse {
  id: string;
  email: string;
  phoneNumber: string;
  role: string;
  isAdmin: boolean;
}

export interface JwtPayload {
  id: string;
  email: string;
  phoneNumber: string;
  isAdmin: boolean;
  role: string;
}
