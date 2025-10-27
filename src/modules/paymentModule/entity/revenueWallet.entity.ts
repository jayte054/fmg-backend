import { BaseEntity, Entity } from 'typeorm';

@Entity()
export class RevenueWalletEntity extends BaseEntity {
   revenueWalletId: string;
}

//todo 
//update UpdatePayment endpoint to use revenueWallet entity to 
// calculate total revenue by driver or dealer
// use wallet strictly for money that can be withdrawn
// for the driver money gotten from cashback purchase
// for the dealer money gotten from all purchases