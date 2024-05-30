import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(RolesGuard)
@Controller('item')
@ApiTags('item')
@ApiBearerAuth('JWT-auth')
export class ItemController {
  private logger = new Logger('Item Controller');
  constructor(private itemService: ItemService) {}

  @Roles('ADMIN')
  @Post('/addItem')
  async addItem(@Body() body: CreateItemDto) {
    this.logger.log(`POST  : Adding item : ${JSON.stringify(body)}`);
    return await this.itemService.addItem(body);
  }

  @Roles('USER')
  @Get('/viewAllitems')
  async viewAll() {
    this.logger.log(`GET  : Getting all items`);
    return await this.itemService.viewAllItems();
  }
  @Roles('ADMIN')
  @Put('updateItem/:itemId')
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() updateItem: UpdateItemDto,
  ) {
    this.logger.log(
      `UPDATE  : Updating the item with id ${itemId} with : ${JSON.stringify(updateItem)}`,
    );
    return await this.itemService.updateItem(itemId, updateItem);
  }

  @Get('viewItemById/:itemId')
  async viewItemById(@Param('itemId') itemId: string) {
    this.logger.log(`GET  : Getting item by id ${itemId}`);
    return await this.itemService.viewItemById(itemId);
  }
  @Roles('ADMIN')
  @Delete('deleteItemById/:itemId')
  async deleteItemById(@Param('itemId') itemId: string) {
    this.logger.log(`DELETE: Deleting item with id ${itemId}`);
    return await this.itemService.deleteItemById(itemId);
  }

  @Get('/viewItemByName/:itemName')
  async viewItemByName(@Param('itemName') itemName: string) {
    this.logger.log(`GET: Getting all items with name ${itemName}`);
    return await this.itemService.viewItemByName(itemName);
  }
  @Roles('USER')
  @Get('/getItemsByRestaurantId/:restaurantId')
  async getItemsByRestaurantName(@Param('restaurantId') restaurantId: string) {
    this.logger.log(
      `GET: Getting all items by restaurant with Id ${restaurantId}  `,
    );
    return await this.itemService.viewItemsByRestaurantId(restaurantId);
  }
}
