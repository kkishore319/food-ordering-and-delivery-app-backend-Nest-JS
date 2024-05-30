import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { ItemService } from '../item/item.service';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Items } from '../item/entities/item.entity';
import { ObjectId } from 'mongodb';

describe('CartService', () => {
  let cartService: CartService;
  let itemService: ItemService;
  let cartRepository: Repository<Cart>;

  const mockCartRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockItemService = {
    viewItemById: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: ItemService, useValue: mockItemService },
        { provide: getRepositoryToken(Cart), useValue: mockCartRepository },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    itemService = module.get<ItemService>(ItemService);
    cartRepository = module.get<Repository<Cart>>(getRepositoryToken(Cart));
  });

  it('should be defined', () => {
    expect(cartService).toBeDefined();
  });

  it('should add a new cart', async () => {
    const mockCart = {
      _id: '123',
      cartId: '1',
      username: 'user',
      items: [],
      totalPrice: 0,
    };
    const mockuser = {
      password: 'Abc@123',
      role: 'ADMIN',
      id: new ObjectId(),
      username: 'ABC',
      email: 'abc@gmail.com',
      phoneNumber: '9876543210',
      country: 'India',
    };
    mockCartRepository.findOne.mockResolvedValueOnce(null);
    mockCartRepository.save.mockResolvedValueOnce(mockCart);
    const result = await cartService.addCart(mockuser, mockCart);
    expect(result).toEqual(mockCart);
    expect(mockCartRepository.findOne).toHaveBeenCalledWith({
      where: { cartId: '1' },
    });
    expect(mockCartRepository.save).toHaveBeenCalledWith(mockCart);
  });

  it('should throw an error if cart already exists', async () => {
    const mockCart = {
      _id: '123',
      cartId: '1',
      username: 'user',
      items: [],
      totalPrice: 0,
    };
    const mockuser = {
      password: 'Abc@123',
      role: 'ADMIN',
      id: new ObjectId(),
      username: 'ABC',
      email: 'abc@gmail.com',
      phoneNumber: '9876543210',
      country: 'India',
    };
    mockCartRepository.findOne.mockResolvedValueOnce(mockCart);
    await expect(cartService.addCart(mockuser, mockCart)).rejects.toThrow(
      'Cart already exists',
    );
  });

  describe('addItemToCart', () => {
    it('should add an item to the cart', async () => {
      const cartId = '1';
      const itemId = '1';
      const mockItem: Items = {
        itemId: '1',
        price: 10,
        itemName: 'Item',
        description: 'Description',
        restaurantId: '1',
        _id: '',
        category: '',
      };
      const mockCart: Cart = {
        cartId: '1',
        items: [],
        totalPrice: 0,
        username: 'user',
        _id: '',
      };
      const expectedCart: Cart = {
        ...mockCart,
        items: [
          {
            itemId: '1',
            price: 10,
            itemName: 'Item',
            description: 'Description',
            restaurantId: '1',
            quantity: 1,
          },
        ],
        totalPrice: 10,
      };
      jest.spyOn(itemService, 'viewItemById').mockResolvedValue(mockItem);
      jest.spyOn(cartService, 'getCartById').mockResolvedValue(mockCart);
      jest.spyOn(cartRepository, 'save').mockResolvedValue(expectedCart);
      const result = await cartService.addItemToCart(cartId, itemId);
      expect(result).toEqual(expectedCart);
      expect(itemService.viewItemById).toHaveBeenCalledWith(itemId);
      expect(cartService.getCartById).toHaveBeenCalledWith(cartId);
      expect(cartRepository.save).toHaveBeenCalledWith(expectedCart);
    });
  });

  it('should return a cart with the given ID', async () => {
    const mockCart = { cartId: '1', items: [], totalPrice: 0 };
    mockCartRepository.findOne.mockResolvedValueOnce(mockCart);
    const result = await cartService.getCartById('1');
    expect(result).toEqual(mockCart);
    expect(mockCartRepository.findOne).toHaveBeenCalledWith({
      where: { cartId: '1' },
    });
  });

  it('should throw NotFoundException if cart with given ID does not exist', async () => {
    mockCartRepository.findOne.mockResolvedValueOnce(null);
    await expect(cartService.getCartById('1')).rejects.toThrow(
      new NotFoundException('Cart with ID 1 not found'),
    );
  });

  it('should return an array of carts', async () => {
    const mockCarts = [{ cartId: '1', items: [], totalPrice: 0 }];
    mockCartRepository.find.mockResolvedValueOnce(mockCarts);
    const result = await cartService.getAllCarts();
    expect(result).toEqual(mockCarts);
    expect(mockCartRepository.find).toHaveBeenCalled();
  });

  it('should throw NotFoundException if no carts found', async () => {
    mockCartRepository.find.mockResolvedValueOnce([]);
    await expect(cartService.getAllCarts()).rejects.toThrow(
      new NotFoundException('No carts found'),
    );
  });

  it('should update the cart with the given ID', async () => {
    const mockCart = {
      _id: '123',
      cartId: '1',
      username: 'user',
      items: [],
      totalPrice: 0,
    };
    const updatedCart = { ...mockCart, totalPrice: 50 };
    mockCartRepository.findOne.mockResolvedValueOnce(mockCart);
    mockCartRepository.save.mockResolvedValueOnce(updatedCart);
    const result = await cartService.updateCart('1', updatedCart);
    expect(result).toEqual(updatedCart);
    expect(mockCartRepository.findOne).toHaveBeenCalledWith({
      where: { cartId: '1' },
    });
    expect(mockCartRepository.save).toHaveBeenCalledWith(updatedCart);
  });

  it('should throw NotFoundException if cart with given ID does not exist', async () => {
    mockCartRepository.findOne.mockResolvedValueOnce(null);
    await expect(cartService.updateCart('1', {} as Cart)).rejects.toThrow(
      new NotFoundException('Cart with ID 1 not found'),
    );
  });

  it('should delete the cart with the given ID', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockCart = { cartId: '1', items: [], totalPrice: 0 };
    mockCartRepository.delete.mockResolvedValueOnce({ affected: 1 });
    const result = await cartService.deleteCartById('1');
    expect(result).toEqual('Deleted Successfully');
    expect(mockCartRepository.delete).toHaveBeenCalledWith({ cartId: '1' });
  });

  describe('deleteCartItem', () => {
    it('should delete an item from the cart', async () => {
      const mockCart = {
        cartId: '1',
        items: [{ itemId: '1', price: 10, quantity: 2 }],
        totalPrice: 20,
      };
      const expectedCart = { ...mockCart, items: [], totalPrice: 0 };
      mockCartRepository.findOne.mockResolvedValueOnce(mockCart);
      mockCartRepository.save.mockResolvedValueOnce(expectedCart);
      const result = await cartService.deleteCartItem('1', '1');
      expect(result).toEqual(expectedCart);
      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { cartId: '1' },
      });
      expect(mockCartRepository.save).toHaveBeenCalledWith(expectedCart);
    });
  });

  describe('increaseItem', () => {
    it('should increase the number of items in the cart', async () => {
      // Mock cart with one item
      const mockCart = {
        cartId: '1',
        items: [{ itemId: '1', price: 10, quantity: 1 }],
        totalPrice: 10,
      };

      // Expected cart after increasing the item quantity
      const expectedCart = {
        ...mockCart,
        items: [{ itemId: '1', price: 10, quantity: 2 }],
        totalPrice: 20,
      };

      // Mock the findOne and save methods of the cart repository
      mockCartRepository.findOne.mockResolvedValueOnce(mockCart);
      mockCartRepository.save.mockResolvedValueOnce(expectedCart);

      // Call the increaseItem method
      const result = await cartService.increaseItem('1', '1');

      // Assert that the result matches the expected cart
      expect(result).toEqual(expectedCart);

      // Assert that findOne was called with the correct cartId
      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { cartId: '1' },
      });

      // Assert that save was called with the expected cart after increasing the item quantity
      expect(mockCartRepository.save).toHaveBeenCalledWith(expectedCart);
    });
  });

  describe('decreaseItem', () => {
    it('should decrease the quantity of the specified item in the cart', async () => {
      // Mock data: mock cart and expected cart after decreasing item quantity
      const mockCart: Cart = {
        cartId: '1',
        username: 'user',
        items: [
          {
            itemId: '1',
            price: 10,
            quantity: 2,
            itemName: '',
            restaurantId: '',
            description: '',
          },
        ],
        totalPrice: 20,
      };
      const expectedCart: Cart = {
        cartId: '1',
        username: 'user',
        items: [
          {
            itemId: '1',
            price: 10,
            quantity: 1,
            itemName: '',
            restaurantId: '',
            description: '',
          },
        ],
        totalPrice: 10,
      };

      // Mocking the behavior of the cart repository methods
      mockCartRepository.findOne.mockResolvedValueOnce(mockCart);
      mockCartRepository.save.mockResolvedValueOnce(expectedCart);

      // Call the service method to decrease item quantity
      const result = await cartService.decreaseItem('1', '1');

      // Assert that the result matches the expected cart
      expect(result).toEqual(expectedCart);

      // Assert that the findOne method of the repository was called with the correct arguments
      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { cartId: '1' },
      });

      // Assert that the save method of the repository was called with the expected cart
      expect(mockCartRepository.save).toHaveBeenCalledWith(expectedCart);
    });
  });
});
