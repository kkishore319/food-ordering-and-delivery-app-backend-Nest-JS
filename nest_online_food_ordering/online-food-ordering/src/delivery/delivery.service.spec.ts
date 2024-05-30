import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryService } from './delivery.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
//import { CreateDeliveryDto } from './dtos/create-delivery.dto';
import { OrderService } from '../order/order.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';

describe('DeliveryService', () => {
  let service: DeliveryService;
  const itemRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const orderMock = {
    getOrder: jest.fn(),
    saveOrder: jest.fn(),
    getAllOrders: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        {
          provide: getRepositoryToken(Delivery),
          useValue: itemRepositoryMock,
        },
        {
          provide: OrderService,
          useValue: orderMock,
        },
      ],
    }).compile();

    service = module.get<DeliveryService>(DeliveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a delivery boy with valid data', async () => {
    const createDeliveryDto: CreateDeliveryDto = {
      name: 'John Doe',
      phoneNumber: '1234567890',
    };
    itemRepositoryMock.create.mockReturnValue(createDeliveryDto);

    itemRepositoryMock.save.mockReturnValue(createDeliveryDto);

    const result = await service.createDeliveryBoy(createDeliveryDto);
    console.log(result);
    expect(result).toEqual(createDeliveryDto);
  });

  it('should update status when order is not delivered', async () => {
    const driverId = '123';
    const mockDriver = {
      order: { orderId: '456', deliveryStatus: 'Pending' },
      assigned: true,
    };
    const mockOrder = {
      orderId: '456',
      deliveryStatus: 'Pending',
      orderStatus: 'Successful',
    };

    itemRepositoryMock.findOne.mockResolvedValue(mockDriver);
    orderMock.getOrder.mockResolvedValue(mockOrder);
    orderMock.saveOrder.mockResolvedValue(mockOrder);

    const result = await service.updateStatus(driverId);
    expect(result).toEqual('Status Updated');
    expect(orderMock.saveOrder).toHaveBeenCalledWith(mockOrder);
    expect(itemRepositoryMock.save).toHaveBeenCalledWith({
      ...mockDriver,
      assigned: false,
      order: null,
    });
  });

  it('should return appropriate message when order is already assigned to another driver', async () => {
    const orderId = 123;
    const mockOrder = {
      orderId,
      deliveryPartnerAssigned: true,
    };

    const mockAvailableDriver = {
      deliveryId: '1',
      name: 'Driver 1',
      assigned: false,
    };

    orderMock.getOrder.mockResolvedValue(mockOrder);

    itemRepositoryMock.find.mockResolvedValue([mockAvailableDriver]);

    const result = await service.assignDrivers(orderId);

    expect(result).toEqual('Order is already assigned to some other driver');
  });

  it('should return all orders with delivery status not "Delivered"', async () => {
    const mockOrders = [
      { orderId: 1, deliveryStatus: 'Pending' },
      { orderId: 2, deliveryStatus: 'In Transit' },
      // Add more mock orders as needed
    ];

    orderMock.getAllOrders.mockResolvedValue(mockOrders);

    const result = await service.viewAllOrders();

    expect(result).toEqual(mockOrders);
    expect(orderMock.getAllOrders).toHaveBeenCalled();
  });

  it('should return a driver by ID', async () => {
    const deliveryId = '1';
    const mockDriver = {
      deliveryId,
      name: 'Driver 1',
      phoneNumber: '1234567890',
    };

    itemRepositoryMock.findOne.mockResolvedValue(mockDriver);

    const result = await service.viewDriverById(deliveryId);

    expect(result).toEqual(mockDriver);
    expect(itemRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { deliveryId },
    });
  });
});
