import { Injectable, Logger } from '@nestjs/common';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentException } from './payment.exception';
import * as nodemailer from 'nodemailer';
@Injectable()
export class PaymentService {
  private readonly logger = new Logger('PaymentController');

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async doPayment(o: Order): Promise<Payment> {
    this.logger.verbose(`Processing payment Data `);
    try {
      const payment = new Payment();
      const randomNumber = Math.floor(Math.random() * 900000000) + 1000000;
      const transactionId = randomNumber.toString();
      payment.paymentDate = new Date();
      payment.transactionId = parseInt(transactionId);
      payment.email = o.email;
      payment.amount = o.cost;
      payment.transactionStatus = o.orderStatus;
      payment.orderId = o.orderId;
      this.logger.log(`Payment successful Save In DataBase `);

      const orderDetails = JSON.stringify(o.orderDetails);
      this.logger.log(
        ` Confirmation of Food Order Payment  orderDetails ${JSON.stringify(orderDetails)}`,
      );

      this.sendEmail(
        payment.email,
        'Order Placed',
        o.orderId,
        orderDetails,
        payment.amount,
      );
      const paymentAdded = await this.paymentRepository.save(payment);
      return paymentAdded;
    } catch (error) {
      throw new PaymentException(`Payment Failed of RS ${o.cost}`);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    ordeId: number,
    orderDetails: string,
    pay: number,
  ): Promise<void> {
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
      html:
        '<h1>Confirmation of Payment: </h1>\n\n<h3>We are writing to confirm that your payment for the food order has been successfully processed.</h3> ' +
        `<h3> Order ID #[ ${JSON.stringify(ordeId)} ]\n Order Details # ${orderDetails.replace(/\[|\]/g, '')}, total amount paid # ${JSON.stringify(pay)} .</h3>
       
        <h4>Thank you for choosing Food Ordering App. We appreciate your order and look forward to serving you.</h4>
        `,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error occurred:', error.message);
        return;
      }
      console.log('Email sent successfully:', info.response);
    });
  }

  async getPayment(orderId: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { orderId },
    });
    this.logger.log(`Get Payment successful : ${JSON.stringify(payment)}`);
    if (payment) {
      return payment;
    } else {
      throw new PaymentException(
        `Payment not found with transactionId ${orderId}`,
      );
    }
  }

  async getAllPayments(): Promise<Payment[]> {
    this.logger.log(`Successful Getall Payments `);
    return await this.paymentRepository.find();
  }

  async changePaymentStatus(id: number, o: Order): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId: id },
    });
    if (payment) {
      payment.transactionStatus = o.orderStatus;
      this.logger.log(
        `Successful Change Payment Status : ${JSON.stringify(payment)} `,
      );

      return await this.paymentRepository.save(payment);
    }
  }

  async paymentSuccess(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId: id },
    });
    if (payment) {
      payment.transactionStatus = 'Payment Done';
      this.logger.log(`Payment Successful   : ${JSON.stringify(payment)} `);
      return await this.paymentRepository.save(payment);
    }
  }

  async deletePayment(id: number): Promise<string> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId: id },
    });
    if (payment) {
      this.logger.log(
        `Payment Successful Delete   : ${JSON.stringify(payment)} `,
      );
      await this.paymentRepository.remove(payment);
      return 'Payment is deleted Successfully';
    } else {
      throw new PaymentException(`The Payment with ${id} is not exists`);
    }
  }
}
