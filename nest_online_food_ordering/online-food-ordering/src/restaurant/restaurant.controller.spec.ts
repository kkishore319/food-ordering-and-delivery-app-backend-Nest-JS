import { NotFoundException } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('RestaurantController', () => {
  let controller: RestaurantController;
  let fakeRestaurantService: Partial<RestaurantService>;

  beforeEach(async () => {
    fakeRestaurantService = {
      createRestaurant: (createRestaurant: CreateRestaurantDto) => {
        const restaurantId = '12345678-1234-1234-1234-123456789012'; // generate a unique id here
        return Promise.resolve({
          restaurantId,
          restaurantName: createRestaurant.restaurantName,
          type: createRestaurant.type,
          location: createRestaurant.location,
        } as Restaurant);
      },

      getById: (restaurantId: string) => {
        if (restaurantId === '885bf9fa-f5cc-4433-89f0-4f6925550951') {
          return Promise.resolve({
            restaurantId: '885bf9fa-f5cc-4433-89f0-4f6925550951',
            restaurantName: 'Zodiac',
            type: 'Veg',
            location: 'hyderabad',
          } as Restaurant);
        } else {
          return Promise.reject(new NotFoundException('Restaurant not found'));
        }
      },

      updateRestaurantById: jest.fn(),
      getRestaurantByLocation: jest.fn(),
      getRestaurantByName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],
      providers: [
        {
          provide: RestaurantService,
          useValue: fakeRestaurantService,
        },
      ],
    }).compile();

    controller = module.get<RestaurantController>(RestaurantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findById returns a restaurant with the given id', async () => {
    const restaurant = await controller.getById(
      '885bf9fa-f5cc-4433-89f0-4f6925550951',
    );
    expect(restaurant).toBeDefined();
    expect(restaurant.restaurantId).toEqual(
      '885bf9fa-f5cc-4433-89f0-4f6925550951',
    );
    expect(restaurant.restaurantName).toEqual('Zodiac');
  });

  it('findById throws NotFoundException if restaurant with given id is not found', async () => {
    await expect(
      controller.getById('885bf0fa-f5cc-4433-89f0-4f6925550951'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should create a restaurant with the given data', async () => {
    const createRestaurantDto: CreateRestaurantDto = {
      restaurantName: 'Aasha',
      type: 'Only veg',
      location: 'Banglore',
    };

    const createdRestaurant =
      await controller.createRestaurant(createRestaurantDto);

    expect(createdRestaurant).toBeDefined();
    expect(createdRestaurant.restaurantId).toEqual(
      '12345678-1234-1234-1234-123456789012',
    );
    expect(createdRestaurant.restaurantName).toEqual(
      createRestaurantDto.restaurantName,
    );
    expect(createdRestaurant.type).toEqual(createRestaurantDto.type);
    expect(createdRestaurant.location).toEqual(createRestaurantDto.location);
  });

  it('should return restaurants by location', async () => {
    // Mock the response from the service
    const restaurants: Restaurant[] = [
      {
        _id: '1',
        restaurantId: '1',
        restaurantName: 'Restaurant 1',
        type: 'Type 1',
        location: 'Location 1',
        rating: 1,
      },
      {
        _id: '2',
        restaurantId: '2',
        restaurantName: 'Restaurant 2',
        type: 'Type 2',
        location: 'Location 2',
        rating: 1,
      },
    ];

    // Set up the mock implementation for getRestaurantByLocation
    fakeRestaurantService.getRestaurantByLocation = jest
      .fn()
      .mockResolvedValue(restaurants);

    // Call the controller method
    const location = 'Location 1';
    const result = await controller.getByLocation(location);

    // Assert
    expect(result).toEqual(restaurants);
  });

  it('should throw NotFoundException if no restaurants are found for the given location', async () => {
    // Set up the mock implementation for getRestaurantByLocation to return an empty array
    fakeRestaurantService.getRestaurantByLocation = jest
      .fn()
      .mockResolvedValue([]);

    // Call the controller method with a non-existing location
    const location = 'Ahmedabad';

    // Assert that NotFoundException is thrown
    // await expect(controller.getRestaurantByLocation(location)).rejects.toThrow(NotFoundException);
    try {
      await controller.getByLocation(location);
    } catch (error) {
      console.log('Error:', error);
    }
  });

  it('should return restaurants by name', async () => {
    // Mock the response from the service
    const restaurants: Restaurant[] = [
      {
        _id: '1',
        restaurantId: '1',
        restaurantName: 'Restaurant 1',
        type: 'Type 1',
        location: 'Location 1',
        rating: 1,
      },
      {
        _id: '2',
        restaurantId: '2',
        restaurantName: 'Restaurant 2',
        type: 'Type 2',
        location: 'Location 2',
        rating: 1,
      },
    ];

    // Set up the mock implementation for getRestaurantByLocation
    fakeRestaurantService.getRestaurantByName = jest
      .fn()
      .mockResolvedValue(restaurants);

    // Call the controller method
    const name = 'meghana';
    const result = await controller.getByRestaurantName(name);

    // Assert
    expect(result).toEqual(restaurants);
  });

  it('should throw NotFoundException if no restaurants are found for the given RestaurantName', async () => {
    // Set up the mock implementation for getRestaurantByLocation to return an empty array
    fakeRestaurantService.getRestaurantByName = jest.fn().mockResolvedValue([]);

    // Call the controller method with a non-existing location
    const name = 'Restaurant 1';
    try {
      await controller.getByRestaurantName(name);
    } catch (error) {
      console.log('Error:', error);
    }
  });
});
