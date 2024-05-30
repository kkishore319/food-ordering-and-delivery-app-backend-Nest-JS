import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartDto } from './dto/cart.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/role.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../get-user-decorator';
import { User } from '../auth/entities/auth.entity';

@UseGuards(RolesGuard)
@Controller('cart')
@ApiTags('cart')
@ApiBearerAuth('JWT-auth')
export class CartController {
  private logger = new Logger('CartController');
  constructor(private readonly cartService: CartService) {}

  @Roles('USER')
  @Post('/addCart')
  async addCart(@GetUser() user: User): Promise<Cart> {
    const cart: Cart = {};
    this.logger.log(`Adding cart: ${JSON.stringify(cart)}`);
    return this.cartService.addCart(user, cart);
  }

  @Roles('ADMIN')
  @Get('getallcarts')
  async getAllCarts(): Promise<Cart[]> {
    this.logger.log('Fetching all carts');
    return this.cartService.getAllCarts();
  }
  @Roles('USER')
  @Post('addingitemtocart')
  async addItemToCart(@Body() cartdto: CartDto): Promise<Cart> {
    this.logger.log(`Adding item to cart: ${JSON.stringify(cartdto)}`);
    const { itemId, cartId } = cartdto;
    return this.cartService.addItemToCart(cartId, itemId);
  }
  @Roles('ADMIN')
  @Get('/:username')
  async getCartByUsername(@Param('username') username: string): Promise<Cart> {
    this.logger.log(`Fetching cart by ID: ${username}`);
    return this.cartService.getCartByUsername(username);
  }
  @Roles('USER')
  @Put('deleteItem')
  async deleteCartItem(@Body() cartdto: CartDto): Promise<Cart> {
    const { itemId, cartId } = cartdto;
    this.logger.log(`Deleting item from cart: ${JSON.stringify(cartdto)}`);
    return this.cartService.deleteCartItem(cartId, itemId);
  }
  @Roles('USER')
  @Put('decreaseQuant')
  async decreaseItem(@Body() cartdto: CartDto): Promise<Cart> {
    const { itemId, cartId } = cartdto;
    this.logger.log(
      `Decreasing item quantity in cart: ${JSON.stringify(cartdto)}`,
    );
    return this.cartService.decreaseItem(itemId, cartId);
  }
  @Roles('USER')
  @Put('increaseQuant')
  async increaseItem(@Body() cartdto: CartDto): Promise<Cart> {
    const { itemId, cartId } = cartdto;
    this.logger.log(
      `Increasing item quantity in cart: ${JSON.stringify(cartdto)}`,
    );
    return this.cartService.increaseItem(itemId, cartId);
  }

  @Roles('USER')
  @Delete('deleteCart/:cartId')
  async deleteCart(@Param('cartId') cartId: string): Promise<string> {
    this.logger.log(`Deleting cart by ID: ${cartId}`);
    return this.cartService.deleteCartById(cartId);
  }
}
