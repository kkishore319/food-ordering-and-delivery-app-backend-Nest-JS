import { Module, forwardRef } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ItemModule } from '../item/item.module';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { CartModule } from '../cart/cart.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { PaymentModule } from '../payment/payment.module';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ItemModule,
    RestaurantModule,
    CartModule,
    PaymentModule,
    forwardRef(() => DeliveryModule),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
