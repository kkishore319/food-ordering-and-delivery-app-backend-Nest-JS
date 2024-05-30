import { Test, TestingModule } from '@nestjs/testing';
import { ItemService } from './item.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateItemDto } from './dto/update-item.dto';
import { Items } from './entities/item.entity';

describe('ItemService', () => {
  const item = {
    _id: '1',
    itemId: '1',
    itemName: 'Pizza',
    category: 'category',
    description: 'Description',
    price: 100,
    restaurantId: '1',
  };

  const createItemDto = {
    itemName: 'Pizza',
    category: 'category',
    description: 'Description',
    price: 100,
    restaurantId: '1',
  };

  let service: ItemService;
  const itemRepositoryMock = {
    save: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(createItemDto),
    remove: jest.fn().mockResolvedValue({}),
  };

  const restaurantMock = {
    getById: () =>
      Promise.resolve({
        _id: '1',
        restaurantId: '1',
        restaurantName: 'Restaurant 1',
        type: 'Type 1',
        location: 'Location 1',
        rating: 1,
      }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService,
        {
          provide: getRepositoryToken(Items),
          useValue: itemRepositoryMock,
        },
        {
          provide: RestaurantService,
          useValue: restaurantMock,
        },
      ],
    }).compile();

    service = module.get<ItemService>(ItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('add Item', async () => {
    itemRepositoryMock.create.mockResolvedValue(createItemDto);
    itemRepositoryMock.save.mockResolvedValue(createItemDto);

    expect(await service.addItem(createItemDto)).toBe(createItemDto);
    expect(itemRepositoryMock.create).toHaveBeenCalled();
    expect(itemRepositoryMock.save).toHaveBeenCalled();
  });

  it('Restaurant not found', async () => {
    restaurantMock.getById = () => Promise.resolve(null);
    await expect(service.addItem(createItemDto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('view all items', async () => {
    const items = [
      {
        _id: '1',
        itemName: 'Pizza',
        category: 'category',
        description: 'Description',
        price: 100,
        restaurantId: '1',
      },
      {
        _id: '2',
        itemName: 'Burger',
        category: 'category',
        description: 'Description',
        price: 300,
        restaurantId: '1',
      },
    ];
    itemRepositoryMock.find.mockResolvedValue(items);
    expect(await service.viewAllItems()).toEqual(items);
  });

  it('no items not found', async () => {
    itemRepositoryMock.find.mockResolvedValue([]);
    await expect(service.viewAllItems()).rejects.toThrow(NotFoundException);
  });

  it('update item by Id', async () => {
    const updateItem: UpdateItemDto = {
      itemName: 'Pizza',
      category: 'updated category',
      description: 'updated description',
      price: 300,
    };

    const updated = {
      restaurantId: '1',
      itemName: 'Pizza',
      category: 'updated category',
      description: 'updated description',
      price: 300,
    };

    itemRepositoryMock.save.mockResolvedValue(updated);
    expect(await service.updateItem('1', updateItem)).toBe(updated);
  });

  it('item id not found while updating', async () => {
    itemRepositoryMock.findOne.mockResolvedValue(null);
    await expect(service.updateItem('1', createItemDto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('view item by id', async () => {
    itemRepositoryMock.findOne.mockResolvedValue(item);
    expect(await service.viewItemById('1')).toEqual(item);
  });

  it('item id not found', async () => {
    itemRepositoryMock.findOne.mockResolvedValue(null);
    await expect(service.viewItemById('2')).rejects.toThrow();
  });

  it('view item by Name', async () => {
    itemRepositoryMock.find.mockResolvedValue(item);
    expect(await service.viewItemByName('Pizza')).toEqual(item);
  });

  it('delete item by id', async () => {
    itemRepositoryMock.findOne.mockResolvedValue(item);
    itemRepositoryMock.remove.mockResolvedValue(item);
    expect(await service.deleteItemById('1')).toEqual(item);
  });
});
