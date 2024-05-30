import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { OrderService } from '../order/order.service';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { AlreadyDeliveredException } from './already-delivered-exception';

@Injectable()
export class DeliveryService {
  private logger = new Logger(DeliveryService.name);

  constructor(
    @InjectRepository(Delivery) private deliveryRepo: Repository<Delivery>,
    @Inject(forwardRef(() => OrderService)) private orderService: OrderService,
  ) {}

  async createDeliveryBoy(
    createDelivery: CreateDeliveryDto,
  ): Promise<Delivery> {
    const { name, phoneNumber } = createDelivery;
    const deliveryId = uuid();
    const partner = await this.deliveryRepo.create({
      deliveryId,
      name,
      phoneNumber,
    });
    this.logger.log('Delivery Partner added');
    return await this.deliveryRepo.save(partner);
  }

  async updateStatus(driverId: string): Promise<string> {
    const driver = await this.viewDriverById(driverId);

    if (driver.order === null) {
      this.logger.log('No Orders assigned');
      return 'No Orders assigned';
    }
    const order = await this.orderService.getOrder(driver.order.orderId);
    if (order.deliveryStatus === 'Delivered') {
      this.logger.error('Item is already delivered');
      throw new AlreadyDeliveredException('Item is already delivered');
    }
    if (order.orderStatus === 'Successful') {
      order.deliveryStatus = 'Delivered';
      this.orderService.saveOrder(order);
      driver.assigned = false;
      driver.order = null;
      await this.deliveryRepo.save(driver);
      return 'Status Updated';
    }
    return 'Payment is pending';
  }

  async getAllDrivers() {
    return await this.deliveryRepo.find();
  }

  async assignDrivers(orderId: number) {
    const order = await this.orderService.getOrder(orderId);
    if (order.deliveryStatus === 'Delivered') {
      this.logger.log('Order is already delivered');
      return 'Order is already delivered';
    }

    if (order.deliveryPartnerAssigned === true) {
      this.logger.error('Order is already assigned');
      return 'Order is already assigned to some other driver';
    }
    let flag = false;
    const drivers = await this.getAllDrivers();

    for (const driver of drivers) {
      if (driver.assigned === false) {
        driver.order = order;
        driver.assigned = true;
        await this.deliveryRepo.save(driver);
        flag = true;
        order.deliveryPartnerAssigned = true;
        await this.orderService.saveOrder(order);
        this.logger.log(`Order ${order.orderId} is assigned to ${driver.name}`);
        return `Order is assigned to ${(driver.name, driver.deliveryId)}`;
      }
    }

    if (flag === false) {
      this.logger.warn('No delivery partners are present');
      return 'No delivery partners are present';
    }
  }

  async viewDriverById(deliveryId: string) {
    return await this.deliveryRepo.findOne({ where: { deliveryId } });
  }

  async viewAllOrders() {
    const orders = await this.orderService.getAllOrders();
    const filter = orders.filter(
      (order) => order.deliveryStatus !== 'Delivered',
    );
    return filter;
  }

  async removeOrder(orderId: number) {
    let flag = false;
    const drivers = await this.getAllDrivers();
    console.log(orderId);
    for (const driver of drivers) {
      if (driver.order !== null && driver.order.orderId === orderId) {
        console.log(orderId);
        driver.order.deliveryPartnerAssigned = false;
        await this.orderService.saveOrder(driver.order);
        driver.order = null;
        driver.assigned = false;

        await this.deliveryRepo.save(driver);
        flag = true;
        return;
      }
    }
    if (flag === false) {
      throw new NotFoundException('Order id is not present');
    }
  }
}
