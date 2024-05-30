import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { Order } from '../order/entities/order.entity';
import { Payment } from './entities/payment.entity';
import { ObjectId } from 'mongodb';
import { PaymentException } from './payment.exception';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepositoryMock: any;

  beforeEach(async () => {
    paymentRepositoryMock = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: 'PaymentRepository', useValue: paymentRepositoryMock },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPayment', () => {
    it('should return a payment', async () => {
      const orderId = 1;
      const payment: Payment = {
        id: new ObjectId(),
        paymentDate: new Date(),
        transactionId: 123456789,
        email: 'testuser',
        amount: 100,
        transactionStatus: 'Pending',
        orderId: 1,
      };

      paymentRepositoryMock.findOne.mockResolvedValue(payment);

      const result = await service.getPayment(orderId);

      expect(paymentRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { orderId },
      });
      expect(result).toEqual(payment);
    });

    it('should throw PaymentException when payment is not found', async () => {
      const orderId = 1;

      paymentRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.getPayment(orderId)).rejects.toThrowError(
        PaymentException,
      );
    });
  });

  describe('getAllPayments', () => {
    it('should return all payments', async () => {
      const payments: Payment[] = [];

      paymentRepositoryMock.find.mockResolvedValue(payments);

      const result = await service.getAllPayments();

      expect(paymentRepositoryMock.find).toHaveBeenCalled();
      expect(result).toEqual(payments);
    });
  });

  describe('changePaymentStatus', () => {
    it('should change payment status', async () => {
      const orderId = 1;
      const newStatus = 'Completed';
      const order: Order = {
        orderId,
        orderStatus: newStatus,
        _id: '',
      };

      const payment: Payment = {
        id: new ObjectId(),
        transactionId: 123,
        amount: 100,
        transactionStatus: 'Pending',
        orderId,
        paymentDate: undefined,
        email: '',
      };

      paymentRepositoryMock.findOne.mockResolvedValue(payment);
      paymentRepositoryMock.save.mockResolvedValue({
        ...payment,
        transactionStatus: newStatus,
      });

      const result = await service.changePaymentStatus(
        payment.transactionId,
        order,
      );

      expect(paymentRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { transactionId: payment.transactionId },
      });
      expect(paymentRepositoryMock.save).toHaveBeenCalledWith({
        ...payment,
        transactionStatus: newStatus,
      });
      expect(result.transactionStatus).toEqual(newStatus);
    });
  });

  describe('paymentSuccess', () => {
    it('should mark payment as successful', async () => {
      const transactionId = 123;
      const payment: Payment = {
        id: new ObjectId(),
        transactionId,
        amount: 100,
        transactionStatus: 'Pending',
        orderId: 1,
        paymentDate: undefined,
        email: '',
      };

      paymentRepositoryMock.findOne.mockResolvedValue(payment);
      paymentRepositoryMock.save.mockResolvedValue({
        ...payment,
        transactionStatus: 'Payment Done',
      });

      const result = await service.paymentSuccess(transactionId);

      expect(paymentRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { transactionId },
      });
      expect(paymentRepositoryMock.save).toHaveBeenCalledWith({
        ...payment,
        transactionStatus: 'Payment Done',
      });
      expect(result.transactionStatus).toEqual('Payment Done');
    });
  });

  describe('deletePayment', () => {
    it('should delete payment if exists', async () => {
      const transactionId = 123;
      const payment: Payment = {
        id: new ObjectId(),
        transactionId,
        amount: 100,
        transactionStatus: 'Pending',
        orderId: 1,
        paymentDate: undefined,
        email: '',
      };

      paymentRepositoryMock.findOne.mockResolvedValue(payment);

      const result = await service.deletePayment(transactionId);

      expect(paymentRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { transactionId },
      });
      expect(paymentRepositoryMock.remove).toHaveBeenCalledWith(payment);
      expect(result).toEqual('Payment is deleted Successfully');
    });

    it('should throw PaymentException if payment does not exist', async () => {
      const transactionId = 123;

      paymentRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.deletePayment(transactionId)).rejects.toThrowError(
        PaymentException,
      );
    });
  });
});
