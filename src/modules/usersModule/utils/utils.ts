import { BuyerEntity } from '../userEntity/buyer.entity';
import {
  PaginatedBuyerInterface,
  // PaginatedBuyerResponseInterface,
  PaginatedDealerResponse,
  PaginatedDealersResponseInterface,
  PaginatedDriverResponseInterface,
  PaginatedDriversResponse,
  PaginatedUserResponseInterface,
} from './user.types';

export const paginatedBuyerResponse = (
  responseInterface: PaginatedBuyerInterface,
): PaginatedUserResponseInterface<BuyerEntity> => {
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

export const paginatedDriverResponse = (
  responseInterface: PaginatedDriverResponseInterface,
): PaginatedDriversResponse => {
  const { drivers, total, skip, take } = responseInterface;
  if (!drivers || drivers.length === 0) {
    return {
      data: [],
      total,
      page: 0,
      perPage: take,
      hasMore: false,
    };
  }

  return {
    data: drivers,
    total,
    page: Math.floor(skip / take) + 1,
    perPage: take,
    hasMore: skip + drivers.length < total,
  };
};

export const paginatedDealerResponse = (
  responseInterface: PaginatedDealersResponseInterface,
): PaginatedDealerResponse => {
  const { dealers, total, skip, take } = responseInterface;
  if (!dealers || dealers.length === 0) {
    return {
      dealers: [],
      total,
      page: 0,
      perPage: take,
      hasMore: false,
    };
  }

  return {
    dealers,
    total,
    page: Math.floor(skip / take) + 1,
    perPage: take,
    hasMore: skip + dealers.length < total,
  };
};
