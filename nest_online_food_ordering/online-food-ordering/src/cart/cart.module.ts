import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './dto/cartItem.dto';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), ItemModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
