import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { ItemService } from '../item/item.service';

@Injectable()
export class RestaurantService {
  private logger = new Logger('Restaurant Service');

  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepo: Repository<Restaurant>,
    @Inject(forwardRef(() => ItemService)) private itemService: ItemService,
  ) {}

  createRestaurant(createRestaurant: CreateRestaurantDto): Promise<Restaurant> {
    console.log(createRestaurant);
    const { restaurantName, type, location } = createRestaurant;
    const restaurantId = uuid();
    const restaurant = this.restaurantRepo.create({
      restaurantId,
      restaurantName,
      type,
      location,
    });
    this.logger.verbose(
      `Adding the restaurant: ${JSON.stringify(createRestaurant)}`,
    );
    return this.restaurantRepo.save(restaurant);
  }

  async getById(restaurantId: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId },
    });
    this.logger.log(`Getting the restaurant by id ${restaurantId}`);
    return restaurant;
  }

  getAllRestaurants() {
    this.logger.log(`Getting the all restaurants`);
    return this.restaurantRepo.find();
  }

  async deleteRestaurantById(restaurantId: string) {
    const restaurant = await this.getById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    const deleted = await this.restaurantRepo.remove(restaurant);
    const items = await this.itemService.viewItemsByRestaurantId(restaurantId);
    items.forEach(
      async (item) => await this.itemService.deleteItemById(item.itemId),
    );
    return deleted;
  }

  async getRestaurantByLocation(location: string) {
    const restaurants = await this.restaurantRepo.find({ where: { location } });
    if (restaurants.length === 0) {
      this.logger.error(
        `Getting the restaurants by location ${location} is failed`,
      );
      throw new NotFoundException('Restaurants not found');
    }
    this.logger.log(`Getting the restaurants by location ${location}`);
    return restaurants;
  }

  async getRestaurantByName(restaurantName: string) {
    const restaurants = await this.restaurantRepo.find({
      where: { restaurantName },
    });
    if (restaurants.length === 0) {
      this.logger.error(
        `Getting the restaurants by name ${restaurantName} is failed`,
      );
      throw new NotFoundException('Restaurants not found');
    }
    this.logger.log(`Getting the restaurant by name ${restaurantName}`);
    return restaurants;
  }

  async updateRestaurantById(
    restaurantId: string,
    updateDto: UpdateRestaurantDto,
  ) {
    const restaurant = await this.getById(restaurantId);
    if (!restaurant) {
      this.logger.error(
        `Updating the restaurant by id ${restaurantId} is failed`,
      );
      throw new NotFoundException('Restaurant not found');
    }
    Object.assign(restaurant, updateDto);
    console.log(updateDto);
    console.log(restaurant);
    this.logger.log(
      `Updating the restaurant by id ${restaurantId} with : ${JSON.stringify(updateDto)}`,
    );
    return this.restaurantRepo.save(restaurant);
  }

  async giveRating(restaurantId: string, rating: number) {
    const restaurant = await this.getById(restaurantId);
    if (!restaurant) {
      this.logger.error(
        `Giving the ${rating} rating to restaurant by id ${restaurantId} is failed`,
      );
      throw new NotFoundException('Restaurant not found');
    }
    restaurant.rating = rating;
    this.logger.log(
      `Giving the ${rating} rating to restaurant by id ${restaurantId}`,
    );
    return this.restaurantRepo.save(restaurant);
  }
}
