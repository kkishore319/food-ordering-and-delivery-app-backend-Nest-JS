/* eslint-disable @typescript-eslint/no-unused-vars */
import { OrderService } from './order.service';
import { CartService } from '../cart/cart.service';
import { PaymentService } from '../payment/payment.service';
import { ItemService } from '../item/item.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { Repository } from 'typeorm';
import { OrderException } from './orderexception';
import { Order } from './entities/order.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/dto/cartItem.dto';
import { Items } from '../item/entities/item.entity';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { ObjectId } from 'mongodb';
import { Payment } from '../payment/entities/payment.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../auth/entities/auth.entity';
import { CreateOrder } from './dto/create-order.dto';
import { DeliveryService } from '../delivery/delivery.service';

describe('OrderService', () => {
  let orderService: OrderService;
  let cartService: CartService;
  let paymentService: PaymentService;
  let itemService: ItemService;
  let restaurantService: RestaurantService;
  let orderRepository: Repository<Order>;

  const mockUser = {
    password: 'Abc@123',
    role: 'ADMIN',
    username: 'ABC',
    email: 'abc@gmail.com',
    phoneNumber: '9876543210',
    country: 'India',
  };

  const mockCart: Cart = {
    cartId: '',
    items: [
      {
        itemId: 'item1',
        itemName: '',
        restaurantId: '',
        description: '',
        price: 0,
        quantity: 0,
      },
    ],
    username: 'user',
  };

  const mockCartService = {
    getCartById: jest.fn(),
    getCartByUsername: jest.fn(),
    deleteCartById: jest.fn(),
  };

  const mockPaymentService = {
    doPayment: jest.fn(),
    getPayment: jest.fn(),
    changePaymentStatus: jest.fn(),
  };

  const mockItemService = {
    viewItemById: jest.fn(),
  };

  const mockRestaurantService = {
    getById: jest.fn(),
  };

  const mockOrderRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockDriver = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: ItemService, useValue: mockItemService },
        { provide: CartService, useValue: mockCartService },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: RestaurantService, useValue: mockRestaurantService },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: DeliveryService, useValue: mockDriver },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    cartService = module.get<CartService>(CartService);
    paymentService = module.get<PaymentService>(PaymentService);
    itemService = module.get<ItemService>(ItemService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  describe('makeOrder', () => {
    it('should make an order successfully', async () => {
      const mockOrder: CreateOrder = {
        orderId: 1234,
        orderStatus: 'pending',
        cost: 100,
      };
      const mockCartId = 'cart123';
      const user: User = {
        password: 'Abc@123',
        role: 'ADMIN',
        username: 'user',
        email: 'abc@gmail.com',
        phoneNumber: '9876543210',
        country: 'India',
      };
      const mockCart: Cart = {
        items: [
          {
            itemId: 'item1',
            itemName: '',
            restaurantId: '',
            description: '',
            price: 0,
            quantity: 0,
          },
          {
            itemId: 'item2',
            itemName: '',
            restaurantId: '',
            description: '',
            price: 0,
            quantity: 0,
          },
        ],
        username: 'user',
        totalPrice: 200,
      };
      const mockItem: Items = {
        _id: 'item123',
        itemId: 'item123',
        category: 'Mock Category',
        description: 'Mock Description',
        itemName: 'Mock Item',
        restaurantId: 'restaurant123',
        price: 10.99,
      };
      const mockRestaurant: Restaurant = {
        _id: 'restaurant123',
        restaurantId: 'restaurant123',
        type: 'Mock Type',
        rating: 4.5,
        location: 'Mock Location',
        restaurantName: 'Mock Restaurant',
      };
      mockCartService.getCartById.mockResolvedValue(mockCart);
      mockItemService.viewItemById.mockResolvedValue(mockItem);
      mockRestaurantService.getById.mockResolvedValue(mockRestaurant);
      mockPaymentService.doPayment.mockResolvedValue(undefined);
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await orderService.makeOrder(
        {} as CreateOrder,
        mockCartId,
        user,
      );

      expect(result).toContain(`Order cost: ${mockOrder.cost}`);
      expect(result).toContain(`Order Id: ${mockOrder.orderId}`);
    });

    it('should throw an error if the order is not placed', async () => {
      const mockCart: Cart = {
        items: [
          {
            itemId: 'item1',
            itemName: '',
            restaurantId: '',
            description: '',
            price: 0,
            quantity: 0,
          },
        ],
        username: 'user',
      };

      const user: User = {
        password: '',
        role: '',
        id: new ObjectId(),
        username: 'user',
        email: '',
        phoneNumber: '',
        country: '',
      };

      mockCartService.getCartById.mockResolvedValue(mockCart);
      mockOrderRepository.save.mockResolvedValue({ orderId: 0 });

      await expect(
        orderService.makeOrder({} as CreateOrder, 'cart123', user),
      ).rejects.toThrow(OrderException);
    });
  });

  describe('updateOrder', () => {
    // it('should update order status to Successful', async () => {
    //   const orderId = 123;
    //   const mockOrder: CreateOrder = { orderId: orderId, cost:90,orderStatus: 'pending' };
    //   const mockUpdatedOrder: Order = { ...mockOrder, orderStatus: 'Successful' };

    //   jest.spyOn(orderService, 'getOrder').mockResolvedValue(mockOrder);
    //   jest.spyOn(orderRepository, 'save').mockResolvedValue(mockUpdatedOrder);

    //   jest.spyOn(paymentService, 'getPayment').mockResolvedValue({
    //     id: new ObjectId(),
    //     orderId: 123,
    //     paymentDate: new Date(),
    //     email: 'user',
    //     transactionId: 456,
    //     amount: 100,
    //     transactionStatus: 'success',
    //   });

    //   const result = await orderService.updateOrder(mockUser,orderId);

    //    mockCartService.getCartByUsername.mockResolvedValue(mockCart);
    //    mockCartService.deleteCartById.mockResolvedValue('Deleted Successfully');

    //   //  jest.spyOn(cartService, 'deleteCartById').mock(mockCart.cartId);
    //    jest.spyOn(orderService, 'updateOrder').mockResolvedValue(mockUpdatedOrder);
    //   expect(result).toEqual(mockUpdatedOrder);
    //   expect(result.orderStatus).toBe('Successful');
    // });

    it('should throw an OrderException if order is not found', async () => {
      const orderId = 0;
      mockOrderRepository.findOneBy.mockResolvedValue(null);
      jest
        .spyOn(orderService, 'getOrder')
        .mockRejectedValue(
          new OrderException(`Order with id ${orderId} is not found`),
        );
      await expect(orderService.updateOrder(mockUser, orderId)).rejects.toThrow(
        OrderException,
      );
    });
  });

  describe('cancelOrder', () => {
    const mockUser = {
      password: 'Abc@123',
      role: 'ADMIN',
      username: 'ABC',
      email: 'abc@gmail.com',
      phoneNumber: '9876543210',
      country: 'India',
    };

    it('should remove order and return success message', async () => {
      const orderId = 123;
      const mockOrder: Order = { orderId: orderId };

      jest.spyOn(orderService, 'getOrder').mockResolvedValue(mockOrder);
      jest.spyOn(orderRepository, 'remove').mockResolvedValue(undefined);

      const result = await orderService.cancelOrder(orderId, mockUser);

      expect(result).toBe('Order is deleted Successfully');
    });

    it('should throw an OrderException if order is not found', async () => {
      const orderId = 123;

      jest.spyOn(orderService, 'getOrder').mockResolvedValue(null);

      await expect(orderService.cancelOrder(orderId, mockUser)).rejects.toThrow(
        OrderException,
      );
    });
  });

  describe('getOrder', () => {
    it('should return the order with the specified ID', async () => {
      const orderId = 123;
      const mockOrder: Order = { orderId: orderId };

      jest.spyOn(orderRepository, 'findOneBy').mockResolvedValue(mockOrder);

      const result = await orderService.getOrder(orderId);

      expect(result).toEqual(mockOrder);
    });

    it('should throw an OrderException if order is not found', async () => {
      const orderId = 123;

      jest.spyOn(orderRepository, 'findOneBy').mockResolvedValue(null);

      await expect(orderService.getOrder(orderId)).rejects.toThrow(
        OrderException,
      );
    });
  });

  describe('getAllOrders', () => {
    it('should return an array of orders', async () => {
      const mockOrders: Order[] = [
        { orderId: 1 },
        { orderId: 2 },
        { orderId: 3 },
      ];

      jest.spyOn(orderRepository, 'find').mockResolvedValue(mockOrders);

      const result = await orderService.getAllOrders();

      expect(result).toEqual(mockOrders);
    });

    it('should throw an OrderException if no orders are found', async () => {
      jest.spyOn(orderRepository, 'find').mockResolvedValue([]);

      await expect(orderService.getAllOrders()).rejects.toThrow(OrderException);
    });
  });

  describe('getOrderByUsername', () => {
    it('should return orders for a given username', async () => {
      const mockOrders: Order[] = [
        { orderId: 1 },
        { orderId: 2 },
        { orderId: 3 },
      ];
      jest.spyOn(orderRepository, 'find').mockResolvedValue(mockOrders);

      const email = 'testUser@mail.com';
      const result = await orderService.getOrderByEmail(email);

      expect(result).toEqual(mockOrders);
    });

    it('should throw an error if no orders are found for the given username', async () => {
      jest.spyOn(orderRepository, 'find').mockResolvedValue([]);

      const email = 'nonExistingUser@email.com';
      await expect(orderService.getOrderByEmail(email)).rejects.toThrow(
        OrderException,
      );
    });
  });

  describe('orderPaymentFailed', () => {
    it('should update order status to "Payment failed" and change payment status', async () => {
      const orderId = 123;
      const mockOrder: Order = {
        orderId,
        orderStatus: 'pending',
        deliveryStatus: 'Order Cancelled',
      };
      const mockPayment: Payment = {
        id: new ObjectId(),
        orderId: 123,
        transactionId: 456,
        paymentDate: new Date(),
        email: 'example_user',
        amount: 100,
        transactionStatus: 'success',
      };

      const updatedOrder: Order = {
        ...mockOrder,
        orderStatus: 'Payment failed',
      };

      jest.spyOn(orderService, 'getOrder').mockResolvedValue(mockOrder);
      jest.spyOn(paymentService, 'getPayment').mockResolvedValue(mockPayment);
      jest.spyOn(orderRepository, 'save').mockResolvedValue(updatedOrder);

      await orderService.orderPaymentFailed(orderId);

      expect(orderService.getOrder).toHaveBeenCalledWith(orderId);
      expect(mockPaymentService.getPayment).toHaveBeenCalledWith(orderId);
      expect(mockPaymentService.changePaymentStatus).toHaveBeenCalledWith(
        mockPayment.transactionId,
        updatedOrder,
      );
      expect(mockOrderRepository.save).toHaveBeenCalledWith(updatedOrder);
    });
  });

  describe('cancelOrder', () => {
    const mockUser = {
      password: 'Abc@123',
      role: 'ADMIN',
      username: 'ABC',
      email: 'abc@gmail.com',
      phoneNumber: '9876543210',
      country: 'India',
    };
    it('should remove order and return success message', async () => {
      const orderId = 123;
      const mockOrder: Order = { orderId: orderId };

      jest.spyOn(orderService, 'getOrder').mockResolvedValue(mockOrder);
      jest.spyOn(orderRepository, 'remove').mockResolvedValue(undefined);

      const result = await orderService.cancelOrder(orderId, mockUser);

      expect(result).toEqual('Order is deleted Successfully');
    });

    it('should throw an OrderException if order is not found', async () => {
      const orderId = 123;

      jest.spyOn(orderService, 'getOrder').mockResolvedValue(null);

      await expect(orderService.cancelOrder(orderId, mockUser)).rejects.toThrow(
        OrderException,
      );
    });
  });
});
