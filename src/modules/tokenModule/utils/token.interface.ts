export interface TokenArray {
  tokenId: string;
}

export interface TokenFilter {
  tokens: TokenArray[];
  verifiedAt?: boolean;
  expiresAt?: boolean;
}

export enum TokenType {
  delivery_token = 'delivery_token',
  change_password_token = 'change_password_token',
}

export interface TokenResponse {
  tokenId: string;
  token: string;
  expiresAt: string;
}

export interface FindTokenFilter {
  tokenId: string;
  userId?: string;
  purchaseId?: string;
}
