import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('delivery')
@UseGuards(RolesGuard)
@ApiTags('delivery')
@ApiBearerAuth('JWT-auth')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Roles('ADMIN')
  @Post('/createDriver')
  async addDeliveryBoy(@Body() createDeliveryDto: CreateDeliveryDto) {
    return await this.deliveryService.createDeliveryBoy(createDeliveryDto);
  }

  @Roles('ADMIN')
  @Get('/updateStatus/:driverId')
  async updateStatus(@Param('driverId') driverId: string) {
    return await this.deliveryService.updateStatus(driverId);
  }

  @Roles('ADMIN')
  @Put('/assignDriver/:orderId')
  async assignDriver(@Param('orderId', new ParseIntPipe()) orderId: number) {
    return await this.deliveryService.assignDrivers(orderId);
  }

  @Roles('ADMIN')
  @Get('/viewAllPendingOrders')
  async viewAllPendingOrders() {
    return await this.deliveryService.viewAllOrders();
  }

  @Delete('/removeOrder/:orderId')
  async removeOrder(@Param('orderId', new ParseIntPipe()) orderId: number) {
    return await this.deliveryService.removeOrder(orderId);
  }
}
