import {
  PaginatedAccessoriesInterface,
  PaginatedAccessoriesResponse,
} from './types';

export const paginatedAccessories = (
  paginatedAccessoriesInterface: PaginatedAccessoriesInterface,
): PaginatedAccessoriesResponse => {
  const { accessories, total, skip, take } = paginatedAccessoriesInterface;

  return {
    accessories,
    total,
    page: skip,
    perPage: take,
  };
};
