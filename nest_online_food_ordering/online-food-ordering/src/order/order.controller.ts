import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/role.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { User } from '../auth/entities/auth.entity';
import { CreateOrder } from './dto/create-order.dto';
import { GetUser } from '../get-user-decorator';
@UseGuards(RolesGuard)
@Controller('order')
@ApiTags('order')
@ApiBearerAuth('JWT-auth')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);
  constructor(private readonly orderService: OrderService) {}

  @Roles('USER')
  @Post('/makeOrder/:cartId')
  async makeAOrder(
    @GetUser() user: User,
    @Body() o: CreateOrder,
    @Param('cartId') cartId: string,
  ): Promise<string> {
    this.logger.log(`Order Created: ${JSON.stringify(o)}`);
    console.log('In the makeAOrder method in controller');
    console.log('creating an order');
    const s = await this.orderService.makeOrder(o, cartId, user);
    return s;
  }
  @Roles('USER')
  @Delete('cancelOrder/:id')
  async cancelOrder(
    @Param('id', new ParseIntPipe()) id: number,
    @GetUser() user: User,
  ): Promise<string> {
    this.logger.log(`Order cancel Succesfully: ${id}`);
    console.log('In the cancelOrder method in controller');
    console.log('Cancelling an order');
    const s = await this.orderService.cancelOrder(id, user);
    return s;
  }
  @Roles('USER')
  @Put('updateAnOrderSuccess/:id')
  async updateAnOrderSuccess(
    @GetUser() user: User,
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Order> {
    this.logger.log(`Order Updated Succesfully: ${id}`);
    console.log('In the updateAnOrder method in controller');
    console.log('updating an order with status successful');
    const s = await this.orderService.updateOrder(user, id);
    return s;
  }

  @Get('viewOrderById/:id')
  async viewAnOrder(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Order> {
    this.logger.log(`Order Viewed : ${id}`);
    console.log('In the viewAnOrder method in controller');
    console.log('viewing order by id');
    const order = await this.orderService.getOrder(id);
    return order;
  }
  @Roles('USER')
  @Get('viewOrderByName/:email')
  async viewByOrderName(@Param('email') email: string): Promise<Order[]> {
    this.logger.log(`viewing order by email : ${email}`);
    console.log('In the viewByOrderName method in controller');
    console.log('viewing order by email');
    const orders = await this.orderService.getOrderByEmail(email);
    return orders;
  }
  @Roles('ADMIN')
  @Get('/viewAllOrders')
  async viewAllOrder(): Promise<Order[]> {
    this.logger.log(`viewing all orders`);
    console.log('In the viewAllOrder method in controller');
    console.log('viewing all orders');
    const orders = await this.orderService.getAllOrders();
    return orders;
  }
  @Put('/updateFailedPayment/:id')
  async updateFailedPayment(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<void> {
    this.logger.log(`changing status to payment failed : ${id}`);
    console.log('In the updateFailedPayment method in controller');
    console.log('changing status to payment failed');
    await this.orderService.orderPaymentFailed(id);
  }
}
