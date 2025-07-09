import { AuthEntity } from 'src/modules/authModule/authEntity/authEntity';
import { DealerService } from 'src/modules/usersModule/service/dealer.service';
import { UpdateCredentials } from 'src/modules/usersModule/utils/user.types';

export const dealerUtils = (dealerService: DealerService) => ({
  updateDealerInfo: (
    user: AuthEntity,
    dealerId: string,
    updateCredentials: UpdateCredentials,
  ) => dealerService.updateDealer(user, dealerId, updateCredentials),
});
