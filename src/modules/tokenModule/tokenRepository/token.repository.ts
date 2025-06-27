import {
  DataSource,
  DeepPartial,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';
import { TokenEntity } from '../tokenEntity/token.entity';
import { Injectable } from '@nestjs/common';
import { FindTokenFilter, TokenFilter } from '../utils/token.interface';

@Injectable()
export class TokenRepository extends Repository<TokenEntity> {
  constructor(private dataSource: DataSource) {
    super(TokenEntity, dataSource.createEntityManager());
  }

  createToken = async (
    input: DeepPartial<TokenEntity>,
  ): Promise<TokenEntity> => {
    const newToken = this.create(input);
    const token = await this.save(newToken);

    return token;
  };

  findTokens = async (): Promise<TokenEntity[]> => this.find();

  findToken = async (
    findTokenFilter: FindTokenFilter,
  ): Promise<TokenEntity> => {
    const { tokenId, userId, purchaseId } = findTokenFilter;
    const query = this.createQueryBuilder('token');

    query.where('token.tokenId = :tokenId', { tokenId });

    if (userId) {
      query.andWhere('token.userId = :userId', { userId });
    }

    if (purchaseId) {
      query.andWhere('token.purchaseId = :purchaseId', { purchaseId });
    }

    return await query.getOne();
  };

  verifyToken = async (tokenId: string) => {
    const token = await this.findOne({ where: { tokenId } });
    token.verificationStatus = true;
    token.verifiedAt = new Date();
    await this.save(token);
    return { ok: true };
  };

  updateToken = async (
    filter: FindOptionsWhere<TokenEntity>,
    data: Partial<TokenEntity>,
  ): Promise<UpdateResult> => {
    return await this.update(filter, data);
  };

  deleteTokens = async (filter: TokenFilter) => {
    const { tokens, verifiedAt, expiresAt } = filter;
    const ids = tokens.map((t) => t.tokenId);

    const query = this.createQueryBuilder();

    query.delete().from(TokenEntity).where('tokenId IN (:...ids)', { ids });

    if (verifiedAt) {
      query.andWhere('verifiedAt IS NOT NULL');
    }

    if (expiresAt) {
      query.andWhere('expiresAt IS NOT NULL');
    }

    await query.execute();
  };

  deleteToken = async (tokenId: string) => {
    return await this.createQueryBuilder('token')
      .delete()
      .where('token.tokenId = :tokenId', { tokenId })
      .execute();
  };
}
