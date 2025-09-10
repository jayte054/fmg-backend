<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

├── package-lock.json
├── package.json
├── src
│   ├── app.module.ts
│   ├── common
│   │   ├── decorators
│   │   │   ├── getAdminDecorator.ts
│   │   │   ├── getBuyerDecorator.ts
│   │   │   ├── getDealerDecorator.ts
│   │   │   └── getDriverDecorator.ts
│   │   ├── exceptions
│   │   │   ├── exceptions.filter.ts
│   │   │   └── exceptions.ts
│   │   ├── guards
│   │   │   └── jwt.authGuard.ts
│   │   └── middleware
│   │       ├── admin.repository.middleware.ts
│   │       ├── auth.cookie.middleware.ts
│   │       ├── buyer.repository.middleware.ts
│   │       ├── dealer.repository.middleware.ts
│   │       └── driver.repository.middleware.ts
│   ├── main.ts
│   ├── migrationUtils
│   │   ├── migration.module.ts
│   │   └── migration.service.ts
│   ├── migrations
│   │   ├── 1752415370116-PaymentEntity.ts
│   │   └── 1752415511862-PaymentEntity.ts
│   ├── modules
│   │   ├── ProductModule
│   │   │   ├── interface
│   │   │   │   └── IProductRepository.interface.ts
│   │   │   ├── product.module.ts
│   │   │   ├── productController
│   │   │   │   └── product.controller.ts
│   │   │   ├── productEntity
│   │   │   │   └── product.entity.ts
│   │   │   ├── productService
│   │   │   │   └── product.service.ts
│   │   │   ├── productsRepository
│   │   │   │   └── product.repository.ts
│   │   │   └── utils
│   │   │       ├── products.dto.ts
│   │   │       ├── products.type.ts
│   │   │       └── utils.ts
│   │   ├── accessoryModule
│   │   │   ├── accessory.module.ts
│   │   │   ├── accessoryController
│   │   │   │   └── accessory.controller.ts
│   │   │   ├── accessoryEntity
│   │   │   │   └── accessoryEntity.ts
│   │   │   ├── accessoryRepository.ts
│   │   │   │   └── accessory.repository.ts
│   │   │   ├── accessoryService
│   │   │   │   └── accessory.service.ts
│   │   │   ├── interface
│   │   │   │   └── iAccessory.interface.ts
│   │   │   └── utils
│   │   │       ├── dto.ts
│   │   │       ├── types.ts
│   │   │       └── utils.ts
│   │   ├── adminModule
│   │   │   ├── admin.module.ts
│   │   │   └── adminAuth
│   │   │       └── adminAuth.entity.ts
│   │   ├── auditLogModule
│   │   │   ├── auditLog.module.ts
│   │   │   ├── auditLogEntity
│   │   │   │   └── auditLog.entity.ts
│   │   │   ├── auditLogRepository
│   │   │   │   └── auditLog.repository.ts
│   │   │   ├── auditLogService
│   │   │   │   └── auditLog.service.ts
│   │   │   ├── interface
│   │   │   │   └── IAuditLogInterface.ts
│   │   │   └── utils
│   │   │       ├── logInterface.ts
│   │   │       └── utils.ts
│   │   ├── authModule
│   │   │   ├── authEntity
│   │   │   │   └── authEntity.ts
│   │   │   ├── authModule.ts
│   │   │   ├── controller
│   │   │   │   └── auth.controller.ts
│   │   │   ├── interface
│   │   │   │   └── auth.interface.ts
│   │   │   ├── repository
│   │   │   │   └── authRepository.ts
│   │   │   ├── service
│   │   │   │   └── auth.service.ts
│   │   │   ├── strategy
│   │   │   │   └── jwt-strategy.ts
│   │   │   └── utils
│   │   │       ├── auth.dto.ts
│   │   │       ├── auth.enum.ts
│   │   │       └── auth.types.ts
│   │   ├── cloudinaryModule
│   │   │   ├── cloudinary.module.ts
│   │   │   ├── cloudinaryConfig
│   │   │   │   ├── cloudinaryConfig.ts
│   │   │   │   └── index.ts
│   │   │   ├── cloudinaryResponse
│   │   │   │   └── cloudinary.response.ts
│   │   │   └── cloudinaryService
│   │   │       └── cloudinary.service.ts
│   │   ├── notificationModule
│   │   │   ├── notifcation.gateway.ts
│   │   │   ├── notification.module.ts
│   │   │   ├── notificationEntity.ts
│   │   │   │   ├── fmgNotification.entity.ts
│   │   │   │   ├── userNotification.entity.ts
│   │   │   │   └── withdrawalRequest.entity.ts
│   │   │   ├── notificationService
│   │   │   │   ├── mailerService.ts
│   │   │   │   ├── messaging.service.ts
│   │   │   │   └── push-notification.service.ts
│   │   │   └── utils
│   │   │       ├── interface.ts
│   │   │       └── notification.dto.ts
│   │   ├── orderTemplateModule
│   │   │   ├── interface
│   │   │   │   └── iOrderRepositoryInterface.ts
│   │   │   ├── orderController
│   │   │   │   └── orderTemplate.controller.ts
│   │   │   ├── orderTemplate.module.ts
│   │   │   ├── orderTemplateEntity
│   │   │   │   └── orderTemplate.entity.ts
│   │   │   ├── orderTemplateRepository
│   │   │   │   └── utils
│   │   │   │       ├── dto.ts
│   │   │   │       ├── types.ts
│   │   │   │       └── utils.ts
│   │   │   ├── orderTemplateService
│   │   │   │   └── orderTemplate.service.ts
│   │   │   └── templateRepository
│   │   │       └── orderTemplate.repository.ts
│   │   ├── paymentModule
│   │   │   ├── controller
│   │   │   │   └── payment.controller.ts
│   │   │   ├── entity
│   │   │   │   ├── cashback.entity.ts
│   │   │   │   ├── payment.entity.ts
│   │   │   │   ├── subaccount.entity.ts
│   │   │   │   └── wallet.entity.ts
│   │   │   ├── interface
│   │   │   │   ├── ICashbackWallet.interface.ts
│   │   │   │   ├── IPaymentRepository.ts
│   │   │   │   ├── ISubAccountRepository.ts
│   │   │   │   └── IWalletRepository.ts
│   │   │   ├── payment.module.ts
│   │   │   ├── repository
│   │   │   │   ├── cashbackWallet.repository.ts
│   │   │   │   ├── payment.repository.ts
│   │   │   │   ├── subaccount.repository.ts
│   │   │   │   └── wallet.repository.ts
│   │   │   ├── service
│   │   │   │   └── payment.service.ts
│   │   │   └── utils
│   │   │       ├── interface.ts
│   │   │       ├── payment.dto.ts
│   │   │       └── utils.ts
│   │   ├── purchaseModule
│   │   │   ├── interface
│   │   │   │   └── IPurchaseRepository.interface.ts
│   │   │   ├── purchase.module.ts
│   │   │   ├── purchaseController
│   │   │   │   └── purchase.controller.ts
│   │   │   ├── purchaseEntity
│   │   │   │   └── purchase.entity.ts
│   │   │   ├── purchaseRepository
│   │   │   │   └── purchase.repository.ts
│   │   │   ├── purchaseService
│   │   │   │   └── purchase.service.ts
│   │   │   └── utils
│   │   │       ├── purchase.dto.ts
│   │   │       ├── purchase.type.ts
│   │   │       └── utils.ts
│   │   ├── tokenModule
│   │   │   ├── controller
│   │   │   │   └── token.controller.ts
│   │   │   ├── interface
│   │   │   │   └── iTokenRepository.ts
│   │   │   ├── token.module.ts
│   │   │   ├── tokenEntity
│   │   │   │   └── token.entity.ts
│   │   │   ├── tokenRepository
│   │   │   │   └── token.repository.ts
│   │   │   ├── tokenService
│   │   │   │   └── token.service.ts
│   │   │   └── utils
│   │   │       └── token.interface.ts
│   │   └── usersModule
│   │       ├── controller
│   │       │   ├── admin.controller.ts
│   │       │   ├── buyer.controller.ts
│   │       │   ├── dealer.controller.ts
│   │       │   └── driver.controller.ts
│   │       ├── interface
│   │       │   └── user.interface.ts
│   │       ├── repository
│   │       │   ├── accessoryDealer.repository.ts
│   │       │   ├── admin.entity.repository.ts
│   │       │   ├── admin.repository.ts
│   │       │   ├── buyer.entity.repository.ts
│   │       │   ├── buyer.repository.ts
│   │       │   ├── dealer.entity.repository.ts
│   │       │   ├── dealer.repository.ts
│   │       │   ├── driver.entity.repository.ts
│   │       │   └── driver.repository.ts
│   │       ├── service
│   │       │   ├── accessoryDealer.service.ts
│   │       │   ├── admin.service.ts
│   │       │   ├── buyer.service.ts
│   │       │   ├── dealer.service.ts
│   │       │   └── driver.service.ts
│   │       ├── user.module.ts
│   │       ├── userEntity
│   │       │   ├── accessoryDealer.entity.ts
│   │       │   ├── admin.entity.ts
│   │       │   ├── buyer.entity.ts
│   │       │   ├── dealerEntity.ts
│   │       │   └── driver.entity.ts
│   │       └── utils
│   │           ├── user.dto.ts
│   │           └── user.types.ts
│   ├── scripts
│   │   └── run-migration.ts
│   └── typeormconfig
│       ├── data-source.ts
│       └── typeorm.config.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
└── tsconfig.json
