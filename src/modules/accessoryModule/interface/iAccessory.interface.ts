import { AccessoryEntity } from '../accessoryEntity/accessoryEntity';
import {
  AccessoryFilter,
  CreateAccessoryInput,
  PaginatedAccessoriesResponse,
} from '../utils/types';

export interface IAccessoryRepositoryInterface {
  createAccessory(
    createAccessoryInput: CreateAccessoryInput,
  ): Promise<AccessoryEntity>;
  findAccessoryById(accessoryId: string): Promise<AccessoryEntity>;
  findAccessories(
    filter: AccessoryFilter,
  ): Promise<PaginatedAccessoriesResponse>;
  updateAccessory(
    accessoryId: string,
    updateAccessoryInput: Partial<AccessoryEntity>,
  ): Promise<AccessoryEntity>;
  deleteAccessory(accessoryId: string): Promise<void>;
  toggleAccessoryStatus(accessoryId: string): Promise<{
    ok: boolean;
    isActive: boolean;
  }>;
}
