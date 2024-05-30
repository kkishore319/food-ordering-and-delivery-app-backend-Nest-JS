import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrder } from './dto/create-order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;

  const mockUser = {
    password: 'Abc@123',
    role: 'ADMIN',
    username: 'ABC',
    email: 'abc@gmail.com',
    phoneNumber: '9876543210',
    country: 'India',
  };

  beforeEach(async () => {
    const orderServiceMock = {
      makeOrder: jest.fn(),
      cancelOrder: jest.fn(),
      updateOrder: jest.fn(),
      getOrder: jest.fn(),
      getOrderByEmail: jest.fn(),
      getAllOrders: jest.fn(),
      orderPaymentFailed: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: orderServiceMock,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('OrderController', () => {
    it('should create an order', async () => {
      const cartId = '123';
      const mockUser = {
        password: 'Abc@123',
        role: 'ADMIN',
        username: 'ABC',
        email: 'abc@gmail.com',
        phoneNumber: '9876543210',
        country: 'India',
      };
      const mockOrder: CreateOrder = {
        address: 'WhiteField',
        pincode: '897689',
      };
      const mockResolve = `orderId:1, orderCost:90 `;
      jest.spyOn(orderService, 'makeOrder').mockResolvedValue(mockResolve);
      const result = await controller.makeAOrder(mockUser, mockOrder, cartId);
      expect(orderService.makeOrder).toHaveBeenCalledWith(
        mockOrder,
        cartId,
        mockUser,
      );
      expect(result).toEqual(mockResolve);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order', async () => {
      const orderId = 123;
      jest
        .spyOn(orderService, 'cancelOrder')
        .mockResolvedValue('Order cancelled successfully');

      const result = await controller.cancelOrder(orderId, mockUser);
      expect(result).toEqual('Order cancelled successfully');
      expect(orderService.cancelOrder).toHaveBeenCalledWith(orderId, mockUser);
    });
  });
  describe('updateAnOrder', () => {
    it('should update an order with status successful', async () => {
      const orderId = 123;
      jest
        .spyOn(orderService, 'updateOrder')
        .mockResolvedValue({ orderId: orderId, orderStatus: 'Successful' });
      const result = await controller.updateAnOrderSuccess(mockUser, orderId);
      expect(result).toEqual({ orderId: orderId, orderStatus: 'Successful' });
      expect(orderService.updateOrder).toHaveBeenCalledWith(mockUser, orderId);
    });
  });

  describe('viewAnOrder', () => {
    it('should return the order with the specified ID', async () => {
      const orderId = 123;
      const mockOrder = { orderId: orderId };
      jest.spyOn(orderService, 'getOrder').mockResolvedValue(mockOrder);
      const result = await controller.viewAnOrder(orderId);
      expect(result).toEqual(mockOrder);
      expect(orderService.getOrder).toHaveBeenCalledWith(orderId);
    });
  });
  describe('viewByOrderName', () => {
    it('should return orders with the specified email', async () => {
      const email = 'testuser@mail.com';
      const mockOrders = [{ orderId: 1 }, { orderId: 2 }];
      jest.spyOn(orderService, 'getOrderByEmail').mockResolvedValue(mockOrders);
      const result = await controller.viewByOrderName(email);
      expect(result).toEqual(mockOrders);
      expect(orderService.getOrderByEmail).toHaveBeenCalledWith(email);
    });
  });
  describe('viewAllOrder', () => {
    it('should return all orders', async () => {
      const mockOrders = [{ orderId: 1 }, { orderId: 2 }];
      jest.spyOn(orderService, 'getAllOrders').mockResolvedValue(mockOrders);
      const result = await controller.viewAllOrder();
      expect(result).toEqual(mockOrders);
      expect(orderService.getAllOrders).toHaveBeenCalled();
    });
  });
  describe('updateFailedPayment', () => {
    it('should update payment status to "Payment failed"', async () => {
      const orderId = 123;
      jest
        .spyOn(orderService, 'orderPaymentFailed')
        .mockResolvedValue(undefined);
      await controller.updateFailedPayment(orderId);
      expect(orderService.orderPaymentFailed).toHaveBeenCalledWith(orderId);
    });
  });
});
