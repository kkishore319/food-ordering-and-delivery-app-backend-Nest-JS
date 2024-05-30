import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';

describe('CartController', () => {
  let controller: CartController;
  let cartService: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            addCart: jest.fn(),
            getAllCarts: jest.fn(),
            addItemToCart: jest.fn(),
            getCartById: jest.fn(),
            getCartByUsername: jest.fn(),
            deleteCartItem: jest.fn(),
            decreaseItem: jest.fn(),
            increaseItem: jest.fn(),
            deleteCartById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addCart', () => {
    it('should add a new cart', async () => {
      const mockCart: Cart = {};
      const mockResolveCart: Cart = {
        cartId: '1',
        items: [],
        totalPrice: 0,
        username: 'user',
        _id: '',
      };
      const mockuser = {
        password: 'Abc@123',
        role: 'ADMIN',
        username: 'ABC',
        email: 'abc@gmail.com',
        phoneNumber: '9876543210',
        country: 'India',
      };
      jest.spyOn(cartService, 'addCart').mockResolvedValue(mockResolveCart);
      const result = await controller.addCart(mockuser);
      expect(result).toEqual(mockResolveCart);
      expect(cartService.addCart).toHaveBeenCalledWith(mockuser, mockCart);
    });
  });

  describe('getAllCarts', () => {
    it('should return an array of carts', async () => {
      const mockCarts: Cart[] = [
        {
          _id: '',
          cartId: '1',
          username: 'user',
          items: [
            {
              itemId: '12345',
              itemName: 'Biryani',
              restaurantId: '335',
              description: 'Good taste',
              price: 200,
              quantity: 2,
            },
          ],
          totalPrice: 400,
        },
      ];
      jest.spyOn(cartService, 'getAllCarts').mockResolvedValue(mockCarts);
      const result = await controller.getAllCarts();
      expect(result).toEqual(mockCarts);
      expect(cartService.getAllCarts).toHaveBeenCalled();
    });
  });

  describe('addItemToCart', () => {
    it('should add an item to the cart', async () => {
      const cartId = '1';
      const itemId = '2';
      const mockCart: Cart = {
        cartId,
        items: [
          {
            itemId: '2',
            itemName: 'Biryani',
            restaurantId: '335',
            description: 'Good taste',
            price: 200,
            quantity: 1,
          },
        ],
        username: 'user',
        totalPrice: 200,
        _id: '',
      };
      jest.spyOn(cartService, 'addItemToCart').mockResolvedValue(mockCart);
      const result = await controller.addItemToCart({ cartId, itemId });
      expect(result).toEqual(mockCart);
      expect(cartService.addItemToCart).toHaveBeenCalledWith(cartId, itemId);
    });
  });

  describe('getCartById', () => {
    it('should return the cart with the given ID', async () => {
      const cartId = '1';
      const mockCart: Cart = {
        cartId,
        items: [
          {
            itemId: '12345',
            itemName: 'Biryani',
            restaurantId: '335',
            description: 'Good taste',
            price: 200,
            quantity: 2,
          },
        ],
        username: 'user',
        totalPrice: 400,
        _id: '',
      };
      jest.spyOn(cartService, 'getCartByUsername').mockResolvedValue(mockCart);
      const result = await controller.getCartByUsername(cartId);
      expect(result).toEqual(mockCart);
      expect(cartService.getCartByUsername).toHaveBeenCalledWith(cartId);
    });
  });

  describe('deleteCartItem', () => {
    it('should delete an item from the cart', async () => {
      const cartId = '1';
      const itemId = '2';
      const mockResolveCart: Cart = {
        cartId,
        items: [],
        totalPrice: 0,
        username: 'user',
        _id: '',
      };
      jest
        .spyOn(cartService, 'deleteCartItem')
        .mockResolvedValue(mockResolveCart);
      const result = await controller.deleteCartItem({ cartId, itemId });
      expect(result).toEqual(mockResolveCart);
      expect(cartService.deleteCartItem).toHaveBeenCalledWith(cartId, itemId);
    });
  });

  describe('decreaseItem', () => {
    it('should decrease the quantity of an item in the cart', async () => {
      const cartId = '1';
      const itemId = '2';
      const mockCart: Cart = {
        cartId,
        items: [
          {
            itemId: '2',
            itemName: 'Biryani',
            restaurantId: '335',
            description: 'Good taste',
            price: 200,
            quantity: 1,
          },
        ],
        username: 'user',
        totalPrice: 200,
        _id: '',
      };
      jest.spyOn(cartService, 'decreaseItem').mockResolvedValue(mockCart);
      const result = await controller.decreaseItem({ cartId, itemId });
      expect(result).toEqual(mockCart);
      expect(cartService.decreaseItem).toHaveBeenCalledWith(itemId, cartId);
    });
  });

  describe('increaseItem', () => {
    it('should increase the quantity of an item in the cart', async () => {
      const cartId = '1';
      const itemId = '2';
      const mockCart: Cart = {
        cartId,
        items: [
          {
            itemId: '2',
            itemName: 'Biryani',
            restaurantId: '335',
            description: 'Good taste',
            price: 200,
            quantity: 2,
          },
        ],
        totalPrice: 400,
        username: 'user',
        _id: '',
      };
      jest.spyOn(cartService, 'increaseItem').mockResolvedValue(mockCart);
      const result = await controller.increaseItem({ cartId, itemId });
      expect(result).toEqual(mockCart);
      expect(cartService.increaseItem).toHaveBeenCalledWith(itemId, cartId);
    });
  });

  describe('deleteCart', () => {
    it('should delete the cart with the given ID', async () => {
      const cartId = '1';
      const expectedResult = 'Deleted Successfully';
      jest
        .spyOn(cartService, 'deleteCartById')
        .mockResolvedValue(expectedResult);
      const result = await controller.deleteCart(cartId);
      expect(result).toEqual(expectedResult);
      expect(cartService.deleteCartById).toHaveBeenCalledWith(cartId);
    });
  });
});
