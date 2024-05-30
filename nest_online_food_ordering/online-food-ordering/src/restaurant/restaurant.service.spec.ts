import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { ItemService } from '../item/item.service';

describe('RestaurantService', () => {
  let restaurantService: RestaurantService;
  const restaurantRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
  };

  const itemServiceMock = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: restaurantRepo,
        },
        {
          provide: ItemService,
          useValue: itemServiceMock,
        },
      ],
    }).compile();

    restaurantService = module.get<RestaurantService>(RestaurantService);
  });

  it('should be defined', () => {
    expect(restaurantService).toBeDefined();
  });

  it('should create a new restaurant', async () => {
    const createRestaurantDto: CreateRestaurantDto = {
      restaurantName: 'Test Restaurant',
      type: 'Italian',
      location: 'New York',
    };

    const savedRestaurant: Restaurant = {
      _id: '123',
      restaurantId: '123',
      restaurantName: 'Test Restaurant',
      type: 'Italian',
      location: 'New York',
      rating: 2,
    };

    restaurantRepo.create.mockReturnValue(savedRestaurant);
    restaurantRepo.save.mockResolvedValue(savedRestaurant);

    const result =
      await restaurantService.createRestaurant(createRestaurantDto);

    expect(restaurantRepo.create).toHaveBeenCalledWith({
      restaurantId: expect.any(String),
      restaurantName: 'Test Restaurant',
      type: 'Italian',
      location: 'New York',
    });
    expect(restaurantRepo.save).toHaveBeenCalledWith(savedRestaurant);
    expect(result).toEqual(savedRestaurant);
  });

  it('should retrieve a restaurant by ID', async () => {
    const restaurantId = '123';
    const restaurant: Restaurant = {
      _id: '123',
      restaurantId,
      restaurantName: 'Test Restaurant',
      type: 'Italian',
      location: 'New York',
      rating: 3,
    };

    restaurantRepo.findOne.mockResolvedValue(restaurant);

    const result = await restaurantService.getById(restaurantId);

    expect(restaurantRepo.findOne).toHaveBeenCalledWith({
      where: { restaurantId },
    });
    expect(result).toEqual(restaurant);
  });

  it('should retrieve a list of restaurants by location', async () => {
    const location = 'New York';
    const restaurants: Restaurant[] = [
      {
        _id: '123',
        restaurantId: '123',
        restaurantName: 'Olive Cafe',
        type: 'Italian',
        location: 'Benagaluru',
        rating: 1,
      },
      {
        _id: '456',
        restaurantId: '456',
        restaurantName: 'Olive Cafe',
        type: 'Chinese',
        location: 'Benagaluru',
        rating: 2,
      },
    ];

    restaurantRepo.find.mockResolvedValue(restaurants); // Mocking the find method

    const result = await restaurantService.getRestaurantByLocation(location);

    expect(restaurantRepo.find).toHaveBeenCalledWith({ where: { location } });
    expect(result).toEqual(restaurants);
  });

  it('should throw NotFoundException if no restaurants found', async () => {
    const location = 'New York';

    restaurantRepo.find.mockResolvedValue([]);

    await expect(
      restaurantService.getRestaurantByLocation(location),
    ).rejects.toThrow(NotFoundException);
  });

  it('should retrieve a list of restaurants by name', async () => {
    const restaurantName = 'Olive Cafe';
    const restaurants: Restaurant[] = [
      {
        _id: '123',
        restaurantId: '123',
        restaurantName,
        type: 'Italian',
        location: 'Benagaluru',
        rating: 1,
      },
      {
        _id: '456',
        restaurantId: '456',
        restaurantName,
        type: 'Chinese',
        location: 'Benagaluru',
        rating: 2,
      },
    ];

    restaurantRepo.find.mockResolvedValue(restaurants);

    const result = await restaurantService.getRestaurantByName(restaurantName);

    expect(restaurantRepo.find).toHaveBeenCalledWith({
      where: { restaurantName },
    });
    expect(result).toEqual(restaurants);
  });

  it('should throw NotFoundException if no restaurants found', async () => {
    const restaurantName = 'Spice and Delight';

    restaurantRepo.find.mockResolvedValue([]);

    await expect(
      restaurantService.getRestaurantByName(restaurantName),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update Resturant data', async () => {
    const restaurant = {
      _id: '123',
      restaurantId: '123',
      restaurantName: 'Dominos',
      type: 'Italian',
      location: 'Benagaluru',
      rating: 1,
    };

    const data = {
      restaurantName: 'Dominos',
      type: 'Veg and Non Veg',
      location: 'Hyderabad',
    };

    restaurantRepo.findOne.mockResolvedValue(restaurant);
    const updated = {
      _id: '123',
      restaurantId: '123',
      restaurantName: 'Dominos',
      type: 'Veg and Non Veg',
      location: 'Hyderabad',
      rating: 1,
    };
    restaurantRepo.save.mockResolvedValue(updated);
    expect(await restaurantService.updateRestaurantById('123', data)).toEqual(
      updated,
    );
  });

  it('should add rating', async () => {
    const restaurant = {
      _id: '123',
      restaurantId: '123',
      restaurantName: 'Dominos',
      type: 'Veg and Non Veg',
      location: 'Hyderabad',
    };

    restaurantRepo.findOne.mockResolvedValue(restaurant);

    const result = {
      _id: '123',
      restaurantId: '123',
      restaurantName: 'Dominos',
      type: 'Veg and Non Veg',
      location: 'Hyderabad',
      rating: 5,
    };
    restaurantRepo.save.mockResolvedValue(result);
    expect(await restaurantService.giveRating('123', 5)).toEqual(result);
  });
});
