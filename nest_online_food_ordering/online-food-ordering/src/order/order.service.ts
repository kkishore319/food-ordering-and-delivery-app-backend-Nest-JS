import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CartService } from '../cart/cart.service';
import { ItemService } from '../item/item.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { Repository } from 'typeorm';
import { OrderException } from './orderexception';
import { PaymentService } from '../payment/payment.service';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/dto/cartItem.dto';
import { Items } from '../item/entities/item.entity';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { DeliveryService } from '../delivery/delivery.service';
import { CreateOrder } from './dto/create-order.dto';
import { User } from '../auth/entities/auth.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject(forwardRef(() => DeliveryService))
    private deliveryService: DeliveryService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cartService: CartService,
    private readonly paymentService: PaymentService,
    private readonly itemService: ItemService,
    private readonly restaurantService: RestaurantService,
  ) {}

  async makeOrder(o: CreateOrder, cartId: string, user: User): Promise<string> {
    console.log('makeOrder method is started');

    let id: number;
    do {
      id = Math.floor(Math.random() * 9000) + 1000;
    } while (String(id).includes('0'));

    const d = new Date();
    o.orderId = id;
    o.orderDate = d;

    const cart: Cart = await this.cartService.getCartById(cartId);

    if (cart.username !== user.username) {
      return 'Logged In user is different';
    }

    if (cart.items.length === 0) {
      return 'Cart is empty';
    }
    const cartlist: CartItem[] = cart.items;
    const itemDetails: string[] = [];

    for (const c of cartlist) {
      const item: Items = await this.itemService.viewItemById(c.itemId);
      const restaurant: Restaurant = await this.restaurantService.getById(
        item.restaurantId,
      );
      itemDetails.push(
        `${item.itemName},Restaurant: ${restaurant.restaurantName},Item Price: ${item.price}`,
      );
    }

    o.orderDetails = itemDetails;
    o.orderStatus = 'pending';
    o.deliveryStatus = 'Delivery guy is on the way';
    o.deliveryPartnerAssigned = false;
    o.cost = cart.totalPrice;
    o.email = user.email;
    const savedOrder: Order = await this.orderRepository.save(o);
    const obj = await this.paymentService.doPayment(savedOrder);
    console.log(obj);
    if (savedOrder.orderId !== 0) {
      this.logger.log(
        `Received order data : ${JSON.stringify(o)} Received cart ID ${JSON.stringify(cartId)}`,
      );
      return `Order cost: ${savedOrder.cost},Order Id: ${savedOrder.orderId}`;
    } else {
      this.logger.error(
        `Failed order data : ${JSON.stringify(o)} Failed cart ID : ${JSON.stringify(cartId)}`,
      );
      throw new OrderException('not placed the order');
    }
  }

  async updateOrder(user: User, id: number): Promise<Order> {
    const order = await this.getOrder(id);
    if (!order) {
      this.logger.error(`Order Updated Successfully ${id}`);
      throw new OrderException(`Order with id ${id} is not found`);
    }
    order.orderStatus = 'Successful';
    const updatedOrder = await this.orderRepository.save(order);
    const pid = (await this.paymentService.getPayment(id)).transactionId;
    await this.paymentService.changePaymentStatus(pid, updatedOrder);
    const cart = await this.cartService.getCartByUsername(user.username);
    await this.cartService.deleteCartById(cart.cartId);
    return updatedOrder;
  }

  async cancelOrder(id: number, current: User): Promise<string> {
    const order = await this.getOrder(id);
    if (!order) {
      this.logger.error(`Order is cancelled ${id}`);
      throw new OrderException(`Order with id ${id} is not found`);
    }
    if (order.deliveryStatus === 'Delivered') {
      return 'Order is already delivered';
    }
    if (order.deliveryPartnerAssigned === true) {
      console.log(id);
      await this.deliveryService.removeOrder(id);
    }
    const orderId = JSON.stringify(order.orderId);

    this.sendEmail(
      current.email,
      'Confirmation of Order Cancellation',
      orderId,
    );
    await this.orderRepository.remove(order);

    return 'Order is deleted Successfully';
  }

  async sendEmail(to: string, subject: string, orderId: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'foodorderingapp12@gmail.com',
        pass: 'zajvyfbgjeghwurw',
      },
    });

    const mailOptions = {
      from: 'foodorderingapp12@gmail.com',
      to,
      subject,
      html: `<h2>We are writing to confirm that your order with order ID #[${JSON.stringify(orderId)}] has been successfully canceled. </h2>
        \n\n\n\n\n
       
        <h3> Thank you for choosing Food Ordering App. We appreciate your understanding. </h3>`,
    };
    console.log('-----------------------------------------------');

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error occurred:', error.message);
        return;
      }
      console.log('Email sent successfully:', info.response);
    });
  }

  async getOrder(id: number): Promise<Order> {
    console.log(id);
    const order: Order = await this.orderRepository.findOneBy({ orderId: id });
    this.logger.log(`Getting Order by id ${id}`);
    if (!order) {
      this.logger.error(`Getting Order by id ${id} is failed`);
      throw new OrderException(`Order with id ${id} is not found`);
    }
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    const orders = await this.orderRepository.find();
    if (orders.length === 0) {
      this.logger.error(`Getting all order is failed`);
      throw new OrderException('No orders found');
    }
    this.logger.log(`Successful Get All Orders`);
    return orders;
  }

  async getOrderByEmail(email: string): Promise<Order[]> {
    const orders = await this.orderRepository.find({ where: { email } });
    if (orders.length === 0) {
      this.logger.error(`Getting order by email ${email} is failed`);
      throw new OrderException(`No order found with email: ${email}`);
    }
    this.logger.log(`Getting orders by name ${email}`);
    return orders;
  }

  async orderPaymentFailed(id: number): Promise<void> {
    const order = await this.getOrder(id);
    order.orderStatus = 'Payment failed';
    order.deliveryStatus = 'Order Cancelled';
    const pid = (await this.paymentService.getPayment(id)).transactionId;
    this.logger.log(`Payment Failed : ${JSON.stringify(id)} `);
    await this.paymentService.changePaymentStatus(pid, order);
    await this.orderRepository.save(order);
  }

  saveOrder(order: Order) {
    return this.orderRepository.save(order);
  }
}
