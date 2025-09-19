import {
  PaginatedBuyerInterface,
  PaginatedBuyerResponseInterface,
} from './user.types';

export const paginatedBuyerResponse = (
  responseInterface: PaginatedBuyerInterface,
): PaginatedBuyerResponseInterface => {
  const { buyers, total, skip, take } = responseInterface;
  if (!buyers || buyers.length === 0) {
    return {
      buyers: [],
      total,
      page: 0,
      perPage: take,
      hasMore: false,
    };
  }

  return {
    buyers,
    total,
    page: Math.floor(skip / take) + 1,
    perPage: take,
    hasMore: skip + buyers.length < total,
  };
};
