import { AuthEntity } from '../../authModule/authEntity/authEntity';
import { DealerService } from '../../usersModule/service/dealer.service';
import { UpdateCredentials } from '../../usersModule/utils/user.types';

export const dealerUtils = (dealerService: DealerService) => ({
  updateDealerInfo: (
    user: AuthEntity,
    dealerId: string,
    updateCredentials: UpdateCredentials,
  ) => dealerService.updateDealer(user, dealerId, updateCredentials),
});
