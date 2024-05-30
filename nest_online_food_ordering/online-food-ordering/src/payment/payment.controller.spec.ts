import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Order } from '../order/entities/order.entity';
import { ObjectId } from 'mongodb';
import { Payment } from './entities/payment.entity';

describe('PaymentController', () => {
  let paymentController: PaymentController;
  let paymentServiceMock: Partial<PaymentService>;

  beforeEach(async () => {
    paymentServiceMock = {
      doPayment: jest.fn(),
      getPayment: jest.fn(),
      getAllPayments: jest.fn(),
      changePaymentStatus: jest.fn(),
      paymentSuccess: jest.fn(),
      deletePayment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [{ provide: PaymentService, useValue: paymentServiceMock }],
    }).compile();

    paymentController = module.get<PaymentController>(PaymentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('doPayment', () => {
    it('should call doPayment method of PaymentService and return payment', async () => {
      const order: Order = {
        _id: '',
        orderId: 0,
      };
      const payment: Payment = {
        id: new ObjectId(),
        transactionId: 0,
        orderId: 0,
        paymentDate: undefined,
        email: '',
        amount: 0,
        transactionStatus: '',
      };

      paymentServiceMock.doPayment = jest.fn().mockResolvedValue(payment);

      const result = await paymentController.doPayment(order);

      expect(paymentServiceMock.doPayment).toHaveBeenCalledWith(order);
      expect(result).toEqual(payment);
    });
  });

  describe('getPayment', () => {
    it('should call getPayment method of PaymentService and return payment', async () => {
      const orderId = 123;
      const payment: Payment = {
        id: new ObjectId(),
        transactionId: 0,
        orderId: 0,
        paymentDate: undefined,
        email: '',
        amount: 0,
        transactionStatus: '',
      };

      paymentServiceMock.getPayment = jest.fn().mockResolvedValue(payment);

      const result = await paymentController.getPayment(orderId);

      expect(paymentServiceMock.getPayment).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(payment);
    });
  });

  describe('getAllPayments', () => {
    it('should call getAllPayments method of PaymentService and return payments', async () => {
      const payments: Payment[] = [
        /* create payment objects */
      ];

      paymentServiceMock.getAllPayments = jest.fn().mockResolvedValue(payments);

      const result = await paymentController.getAllPayments();

      expect(paymentServiceMock.getAllPayments).toHaveBeenCalled();
      expect(result).toEqual(payments);
    });
  });

  describe('updatePayment', () => {
    it('should call changePaymentStatus method of PaymentService and return updated payment', async () => {
      const id = 123;
      const order: Order = {
        _id: '',
        orderId: 0,
      };
      const payment: Payment = {
        id: new ObjectId(),
        transactionId: 0,
        orderId: 0,
        paymentDate: undefined,
        email: '',
        amount: 0,
        transactionStatus: '',
      };

      paymentServiceMock.changePaymentStatus = jest
        .fn()
        .mockResolvedValue(payment);

      const result = await paymentController.updatePayment(id, order);

      expect(paymentServiceMock.changePaymentStatus).toHaveBeenCalledWith(
        id,
        order,
      );
      expect(result).toEqual(payment);
    });
  });

  describe('updatePaymentToSuccess', () => {
    it('should call paymentSuccess method of PaymentService and return updated payment', async () => {
      const id = 123;
      const payment: Payment = {
        id: new ObjectId(),
        transactionId: 0,
        orderId: 0,
        paymentDate: undefined,
        email: '',
        amount: 0,
        transactionStatus: '',
      };

      paymentServiceMock.paymentSuccess = jest.fn().mockResolvedValue(payment);

      const result = await paymentController.updatePaymentToSuccess(id);

      expect(paymentServiceMock.paymentSuccess).toHaveBeenCalledWith(id);
      expect(result).toEqual(payment);
    });
  });

  describe('deletePayment', () => {
    it('should call deletePayment method of PaymentService and return success message', async () => {
      const id = 123;
      const successMessage = 'Payment is deleted Successfully';

      paymentServiceMock.deletePayment = jest
        .fn()
        .mockResolvedValue(successMessage);

      const result = await paymentController.deletePayment(id);

      expect(paymentServiceMock.deletePayment).toHaveBeenCalledWith(id);
      expect(result).toEqual(successMessage);
    });
  });
});
