import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart/entities/cart.entity';
import { CartItem } from './cart/dto/cartItem.dto';
import { RestaurantModule } from './restaurant/restaurant.module';
import { Restaurant } from './restaurant/entities/restaurant.entity';
import { Order } from './order/entities/order.entity';
import { ItemModule } from './item/item.module';
import { Items } from './item/entities/item.entity';
import { PaymentModule } from './payment/payment.module';
import { Payment } from './payment/entities/payment.entity';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/auth.entity';
import { DeliveryModule } from './delivery/delivery.module';
import { Delivery } from './delivery/entities/delivery.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: 'mongodb://localhost/onlinefoodordering',
      synchronize: true,
      useUnifiedTopology: true,
      entities: [
        Cart,
        CartItem,
        Restaurant,
        Order,
        Items,
        Payment,
        User,
        Delivery,
      ],
    }),
    CartModule,
    OrderModule,
    RestaurantModule,
    ItemModule,
    PaymentModule,
    AuthModule,
    DeliveryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
