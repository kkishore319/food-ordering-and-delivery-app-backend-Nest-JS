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
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@UseGuards(RolesGuard)
@Controller('restaurant')
@ApiTags('restaurant')
@ApiBearerAuth('JWT-auth')
export class RestaurantController {
  private logger = new Logger('Restaurant Controller');
  constructor(private readonly restaurantService: RestaurantService) {}
  @Roles('ADMIN')
  @Post('createRestaurant')
  createRestaurant(@Body() createRestaurant: CreateRestaurantDto) {
    this.logger.log(
      `POST: Adding the restaurant: ${JSON.stringify(createRestaurant)}`,
    );
    return this.restaurantService.createRestaurant(createRestaurant);
  }

  @Get('getById/:restaurantId')
  async getById(@Param('restaurantId') restaurantId: string) {
    const restaurant = await this.restaurantService.getById(restaurantId);
    if (!restaurant) {
      this.logger.error(
        `GET: Getting the restaurant by id ${restaurantId} is failed`,
      );
      throw new NotFoundException('Restaurant not found');
    }
    return restaurant;
  }
  @Roles('USER')
  @Get('getByLocation/location/:location')
  async getByLocation(@Param('location') location: string) {
    this.logger.log(`GET: Getting the restaurants by location ${location}`);
    return await this.restaurantService.getRestaurantByLocation(location);
  }
  @Roles('USER')
  @Get('getByRestaurantName/name/:restaurantName')
  async getByRestaurantName(@Param('restaurantName') restaurantName: string) {
    this.logger.log(
      `GET: Getting the restaurants by restaurant name ${restaurantName}`,
    );
    return await this.restaurantService.getRestaurantByName(restaurantName);
  }
  @Roles('ADMIN')
  @Put('updateRestaurantById/:restaurantId')
  async updateRestaurantById(
    @Param('restaurantId') restaurantId: string,
    @Body() updateDto: UpdateRestaurantDto,
  ) {
    const restaurant = await this.restaurantService.updateRestaurantById(
      restaurantId,
      updateDto,
    );
    this.logger.log(
      `UPDATE: Updating the restaurant by id ${restaurantId}:${JSON.stringify(updateDto)}`,
    );
    return restaurant;
  }

  @Get('/getAllRestaurants')
  async getAll() {
    this.logger.log(`GET: Getting the all restaurants`);
    return this.restaurantService.getAllRestaurants();
  }
  @Roles('ADMIN')
  @Delete('deleteRestaurantById/:restaurantId')
  async deleteRestaurantById(@Param('restaurantId') restaurantId: string) {
    this.logger.log(`DELETE: Deleting the restaurant by id ${restaurantId}`);
    return this.restaurantService.deleteRestaurantById(restaurantId);
  }

  @Roles('USER')
  @Put('/giveRating/:restaurantId/:rating')
  giveRating(
    @Param('restaurantId') restaurantId: string,
    @Param('rating', new ParseIntPipe()) rating: number,
  ) {
    this.logger.log(
      `PUT: Updating the restaurant rating by id ${restaurantId}`,
    );
    return this.restaurantService.giveRating(restaurantId, rating);
  }
}
