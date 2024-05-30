import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Items } from './entities/item.entity';
import { RestaurantService } from '../restaurant/restaurant.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ItemService {
  private logger = new Logger('Item Service');
  constructor(
    @InjectRepository(Items) private itemRepository: Repository<Items>,
    private restaurantService: RestaurantService,
  ) {}

  async addItem(item: CreateItemDto): Promise<Items> {
    const restaurant = await this.restaurantService.getById(item.restaurantId);
    if (restaurant) {
      const itemId = uuid();
      const { itemName, category, description, price, restaurantId } = item;
      const created = this.itemRepository.create({
        itemId,
        itemName,
        category,
        description,
        price,
        restaurantId,
      });
      this.logger.verbose(`Adding item : ${JSON.stringify(item)} `);
      return await this.itemRepository.save(created);
    } else {
      this.logger.error(`Adding item is failed`);
      throw new NotFoundException(
        `The restaurant with ${item.restaurantId} id is not found`,
      );
    }
  }

  async viewAllItems(): Promise<Items[]> {
    const allItems: Items[] = await this.itemRepository.find();
    if (allItems.length > 0) {
      this.logger.log(`Getting all items`);
      return allItems;
    } else {
      this.logger.error(`Getting all items is failed`);
      throw new NotFoundException('No Items found');
    }
  }

  async updateItem(itemId: string, updateItem: UpdateItemDto) {
    const item = await this.itemRepository.findOne({ where: { itemId } });
    if (!item) {
      this.logger.error(`Updating item with id ${itemId} is failed `);
      throw new NotFoundException('Item not found');
    }
    Object.assign(item, updateItem);
    this.logger.log(
      `Updating the item with id ${itemId} with : ${JSON.stringify(updateItem)}`,
    );
    return await this.itemRepository.save(item);
  }

  async viewItemById(itemId: string) {
    const item = await this.itemRepository.findOne({ where: { itemId } });
    if (!item) {
      this.logger.log(
        `Updating the item with id ${itemId} with : ${JSON.stringify(this.updateItem)}`,
      );
      throw new NotFoundException('Item not found');
    }
    this.logger.log(`Getting item with id ${itemId}`);

    return item;
  }

  async deleteItemById(itemId: string) {
    const item = await this.itemRepository.findOne({ where: { itemId } });
    if (!item) {
      this.logger.error(`Deleting item by id ${itemId} is failed`);
      throw new NotFoundException('Item not found');
    }
    this.logger.log(`Deleting the item with id ${itemId}`);
    return await this.itemRepository.remove(item);
  }

  async viewItemByName(itemName: string) {
    const item = await this.itemRepository.find({ where: { itemName } });
    if (!item) {
      this.logger.error(`Getting item by name ${itemName}  is failed`);
      throw new NotFoundException('Item not found');
    }
    this.logger.log(`Getting item by item name ${itemName}`);
    return item;
  }

  async viewItemsByRestaurantId(restaurantId: string) {
    const items = await this.viewAllItems();
    const filtered = items.filter((i) => i.restaurantId === restaurantId);
    if (filtered.length === 0) {
      this.logger.log(`Getting items by the restaurant id ${restaurantId}`);

      this.logger.error(
        `Getting all items by restaurant id ${restaurantId} is failed`,
      );
      throw new NotFoundException('No Items present');
    }
    this.logger.log(`Getting items by the restaurant id ${restaurantId}`);
    return filtered;
  }
}
