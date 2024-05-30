import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

describe('ItemController', () => {
  let itemController: ItemController;
  const mockItemService = {
    addItem: jest.fn(),
    viewItemById: jest.fn().mockResolvedValue({}),
    viewAllItems: jest.fn().mockResolvedValue({}),
    updateItem: jest.fn().mockResolvedValue({}),
    deleteItemById: jest.fn().mockResolvedValue({}),
    viewItemByName: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        {
          provide: ItemService,
          useValue: mockItemService,
        },
      ],
    }).compile();

    itemController = module.get<ItemController>(ItemController);
  });

  it('should be defined', () => {
    expect(itemController).toBeDefined();
  });

  describe('addItem', () => {
    it('should add an item when given valid data', async () => {
      const mockItem: CreateItemDto = {
        itemName: 'Test Item',
        category: 'Test Category',
        description: 'Test Description',
        price: 10,
        restaurantId: 'valid-restaurant-id',
      };

      const mockRestaurant = {
        _id: '1',
        restaurantId: '1',
        restaurantName: 'Restaurant 1',
        type: 'Type 1',
        location: 'Location 1',
        rating: 1,
      };

      mockItemService.viewItemById.mockResolvedValue(mockRestaurant);
      mockItemService.addItem.mockResolvedValue(mockItem);

      const result = await itemController.addItem(mockItem);

      expect(result).toEqual(mockItem);
    });
  });

  describe('viewAll', () => {
    it('should return all items when items are found', async () => {
      const mockItems: CreateItemDto = {
        itemName: 'Test Item',
        category: 'Test Category',
        description: 'Test Description',
        price: 10,
        restaurantId: 'valid-restaurant-id',
      };

      // Mock the behavior of viewAllItems to return mockItems
      mockItemService.viewAllItems.mockResolvedValue(mockItems);

      const result = await itemController.viewAll();

      expect(result).toEqual(mockItems);
    });

    describe('updateItem', () => {
      it('should update item when item is found', async () => {
        const itemId = 'mocked-item-id';
        const updateDto: UpdateItemDto = {
          itemName: 'Test Item',
          category: 'Test Category',
          description: 'Test Description',
          price: 10,
        };
        const updatedItem = { itemId, ...updateDto };

        // Mock the behavior of updateItem to return the updated item
        mockItemService.updateItem.mockResolvedValue(updatedItem);

        const result = await itemController.updateItem(itemId, updateDto);

        expect(result).toEqual(updatedItem);
      });
    });

    describe('deleteItemById', () => {
      it('should delete item when item is found', async () => {
        const itemId = 'mocked-item-id';

        // Mock the behavior of deleteItemById
        mockItemService.deleteItemById.mockResolvedValue({ itemId: 'hello' });

        const result = await itemController.deleteItemById(itemId);

        expect(result).toBeDefined();
      });
    });

    describe('viewItemByName', () => {
      it('should return item when item is found by name', async () => {
        const itemName = 'mocked-item-name';
        const mockItem: CreateItemDto = {
          itemName: 'Test Item',
          category: 'Test Category',
          description: 'Test Description',
          price: 10,
          restaurantId: 'valid-restaurant-id',
        };

        // Mock the behavior of viewItemByName to return the mock item
        mockItemService.viewItemByName.mockResolvedValue(mockItem);

        const result = await itemController.viewItemByName(itemName);

        expect(result).toEqual(mockItem);
      });
    });
  });
});
