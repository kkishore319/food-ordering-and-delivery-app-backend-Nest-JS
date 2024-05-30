import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { AlreadyDeliveredException } from './already-delivered-exception';
import { Delivery } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
//import { CreateDeliveryDto } from "./dtos/create-delivery.dto";

describe('DeliveryController', () => {
  let controller: DeliveryController;
  let deliveryService: DeliveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        {
          provide: DeliveryService,
          useValue: {
            updateStatus: jest.fn(),
            createDeliveryBoy: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DeliveryController>(DeliveryController);
    deliveryService = module.get<DeliveryService>(DeliveryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Adding delivery boy', () => {
    it('should add delivery boy', async () => {
      const createDeliveryDto: CreateDeliveryDto = {
        name: 'John Doe',
        phoneNumber: '1234567890',
      };
      const createdDelivery: Delivery = {
        _id: '1',
        deliveryId: '1',
        name: 'John Doe',
        phoneNumber: '1234567890',
      };

      // Stub the method with a resolved value
      (deliveryService.createDeliveryBoy as jest.Mock).mockResolvedValue(
        createdDelivery,
      );

      const result = await controller.addDeliveryBoy(createDeliveryDto);

      expect(result).toEqual(createdDelivery);
    });
  });

  describe('updateStatus', () => {
    it('should return "Status Updated" when order status is Successful', async () => {
      const driverId = 'someDriverId';
      const expectedResult = 'Status Updated';

      (deliveryService.updateStatus as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.updateStatus(driverId);

      expect(result).toEqual(expectedResult);
      expect(deliveryService.updateStatus).toHaveBeenCalledWith(driverId);
    });

    it('should return "No Orders assigned" when driver has no orders assigned', async () => {
      const driverId = 'someDriverId';
      const expectedResult = 'No Orders assigned';

      (deliveryService.updateStatus as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.updateStatus(driverId);

      expect(result).toEqual(expectedResult);
      expect(deliveryService.updateStatus).toHaveBeenCalledWith(driverId);
    });

    it('should throw AlreadyDeliveredException when order delivery status is Delivered', async () => {
      const driverId = 'someDriverId';
      const errorMessage = 'Item is already delivered';

      (deliveryService.updateStatus as jest.Mock).mockRejectedValue(
        new AlreadyDeliveredException(errorMessage),
      );

      await expect(controller.updateStatus(driverId)).rejects.toThrow(
        AlreadyDeliveredException,
      );
      expect(deliveryService.updateStatus).toHaveBeenCalledWith(driverId);
    });

    it('should return "Payment is pending" when order status is not Successful', async () => {
      const driverId = 'someDriverId';
      const expectedResult = 'Payment is pending';

      (deliveryService.updateStatus as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.updateStatus(driverId);

      expect(result).toEqual(expectedResult);
      expect(deliveryService.updateStatus).toHaveBeenCalledWith(driverId);
    });
  });
});
