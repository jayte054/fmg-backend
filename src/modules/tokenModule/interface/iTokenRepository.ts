import { DeepPartial, FindOptionsWhere, UpdateResult } from 'typeorm';
import { TokenEntity } from '../tokenEntity/token.entity';
import { FindTokenFilter, TokenArray } from '../utils/token.interface';

export interface ITokenRepository {
  createToken(input: DeepPartial<TokenEntity>): Promise<TokenEntity>;
  findTokens(): Promise<TokenEntity[]>;
  findToken(findTokenFilter: FindTokenFilter): Promise<TokenEntity>;
  updateToken(
    filter: FindOptionsWhere<TokenEntity>,
    data: Partial<TokenEntity>,
  ): Promise<UpdateResult>;
  verifyToken(tokenId: string): Promise<{ ok: true }>;
  deleteToken(tokenId: string): Promise<void>;
  deleteTokens(tokens: Array<TokenArray>): Promise<void>;
}
