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
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/role.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(RolesGuard)
@Controller('payment')
@ApiTags('payment')
@ApiBearerAuth('JWT-auth')
export class PaymentController {
  private readonly logger = new Logger('PaymentController');
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/doPayment')
  async doPayment(@Body() o: Order): Promise<Payment> {
    this.logger.verbose(
      `Post  : Processing payment for order : ${JSON.stringify(o)}`,
    );
    return await this.paymentService.doPayment(o);
  }
  @Roles('USER')
  @Get('/getByTransactionId/:orderId')
  async getPayment(
    @Param('orderId', new ParseIntPipe()) orderId: number,
  ): Promise<Payment> {
    this.logger.verbose(`Get  : Fetching payment for order ID: ${orderId}`);

    return await this.paymentService.getPayment(orderId);
  }
  @Roles('ADMIN')
  @Get('/getAllPayment')
  async getAllPayments(): Promise<Payment[]> {
    this.logger.verbose(`Get  : Fetching All payments data`);
    return await this.paymentService.getAllPayments();
  }

  @Put('/updatePaymentFailed/:id')
  async updatePayment(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() o: Order,
  ): Promise<Payment> {
    this.logger.verbose(
      `Put  : Update  Failed Payment Data for order ID: ${id}. Filters :${JSON.stringify(o)}`,
    );
    return await this.paymentService.changePaymentStatus(id, o);
  }

  @Put('/updatePaymentSuccess/:id')
  async updatePaymentToSuccess(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Payment> {
    this.logger.verbose(`Put  : Update Success Payment for order ID: ${id}. }`);
    return await this.paymentService.paymentSuccess(id);
  }
  @Roles('ADMIN')
  @Delete('/deletePayment/:id')
  async deletePayment(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<string> {
    this.logger.verbose(`Delete : Delete  Payment for order ID: ${id}. }`);
    return await this.paymentService.deletePayment(id);
  }
}
