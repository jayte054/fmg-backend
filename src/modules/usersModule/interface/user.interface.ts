import { CreateBuyerDto } from '../utils/user.dto';
import { CreateBuyerResponse } from '../utils/user.types';

export interface IBuyerRepository {
  createBuyer(createBuyerDto: CreateBuyerDto): Promise<CreateBuyerResponse>;
  findBuyerById(userId: string): Promise<CreateBuyerResponse>;
}
