import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { CartItem } from './dto/cartItem.dto';
import { ItemService } from '../item/item.service';
import { v4 as uuid } from 'uuid';
import { Items } from '../item/entities/item.entity';
import { User } from '../auth/entities/auth.entity';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    readonly itemsService: ItemService,
  ) {}

  async addCart(user: User, cart: Cart): Promise<Cart> {
    if (await this.cartRepository.findOne({ where: { cartId: cart.cartId } })) {
      throw new Error('Cart already exists');
    } else {
      cart.cartId = uuid();
      cart.items = [];
      cart.username = user.username;
      return this.cartRepository.save(cart);
    }
  }
  async getCartByUsername(username: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { username: username },
    });
    this.logger.log(`Fetching cart by ID: ${username}`);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${username} not found`);
    }
    return cart;
  }

  async getCartById(cartId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { cartId: cartId },
    });
    this.logger.log(`Fetching cart by ID: ${cartId}`);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }
    return cart;
  }

  async getAllCarts(): Promise<Cart[]> {
    const carts = await this.cartRepository.find();
    if (!carts.length) {
      this.logger.error(`Getting all carts is failed`);
      throw new NotFoundException('No carts found');
    }
    this.logger.log(`Successful Getall Carts `);
    return carts;
  }

  async updateCart(cartId: string, cart: Cart): Promise<Cart> {
    const existingCart = await this.getCartById(cartId);
    existingCart.cartId = cart.cartId;
    existingCart.items = cart.items;
    existingCart.totalPrice = cart.totalPrice;
    return this.cartRepository.save(existingCart);
  }

  async deleteCartById(cartId: string): Promise<string> {
    await this.cartRepository.delete({ cartId });
    this.logger.log(
      `Successful Change Payment Status : ${JSON.stringify(cartId)} `,
    );
    return 'Deleted Successfully';
  }

  async addItemToCart(cartId: string, itemId: string): Promise<Cart> {
    const item: Items = await this.itemsService.viewItemById(itemId);
    const restaurantId = item.restaurantId;
    console.log(restaurantId);
    const cart = await this.getCartById(cartId);

    const itemExistsInCart = cart.items.some((i) => i.itemId === itemId);

    if (itemExistsInCart) {
      this.logger.log(
        `Item exiting cart : ${JSON.stringify(itemExistsInCart)} `,
      );
      cart.items.map((i) => {
        if (i.itemId === itemId) {
          i.quantity++;
        }
      });
    } else {
      this.logger.log(`Updating the cart Item`);
      const newItem: CartItem = {
        itemId: itemId,
        price: item.price,
        itemName: item.itemName,
        description: item.description,
        restaurantId: restaurantId,
        quantity: 1,
      };
      cart.items.push(newItem);
    }

    const totalPrice = this.calculateTotalPrice(cart);
    cart.totalPrice = totalPrice;
    this.logger.log(`Data Saved`);
    return this.cartRepository.save(cart);
  }

  async deleteCartItem(cartId: string, itemId: string): Promise<Cart> {
    this.logger.log(
      `Delete cart : ${JSON.stringify(cartId)}  Item Id: ${JSON.stringify(itemId)} `,
    );
    const cart = await this.getCartById(cartId);
    cart.items = cart.items.filter((item) => item.itemId !== itemId);
    const totalPrice = this.calculateTotalPrice(cart);
    cart.totalPrice = totalPrice;
    this.logger.log(`Update cart---Item deleting`);
    return this.cartRepository.save(cart);
  }

  async decreaseItem(itemId: string, cartId: string): Promise<Cart> {
    this.logger.log(
      `Decrease Item : ${JSON.stringify(cartId)}  Item Id: ${JSON.stringify(itemId)} `,
    );
    const cart = await this.getCartById(cartId);
    cart.items.map((item) => {
      if (item.itemId === itemId && item.quantity > 0) {
        item.quantity--;
      }
    });
    const totalPrice = this.calculateTotalPrice(cart);
    cart.totalPrice = totalPrice;
    this.logger.log(`Decrease cart`);
    return this.cartRepository.save(cart);
  }

  async increaseItem(itemId: string, cartId: string): Promise<Cart> {
    this.logger.log(
      `Increase Item : ${JSON.stringify(cartId)}  Item Id: ${JSON.stringify(itemId)} `,
    );
    const cart = await this.getCartById(cartId);
    cart.items.forEach((item) => {
      if (item.itemId === itemId) {
        item.quantity++;
      }
    });
    const totalPrice = this.calculateTotalPrice(cart);
    cart.totalPrice = totalPrice;
    this.logger.log(`Increase cart`);
    return this.cartRepository.save(cart);
  }

  private calculateTotalPrice(cart: Cart): number {
    return cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }
}
