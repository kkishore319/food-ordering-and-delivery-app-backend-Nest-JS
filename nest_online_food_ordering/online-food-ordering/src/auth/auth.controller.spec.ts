import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserDto } from './Dto/user.dto';
import { ObjectId } from 'mongodb';
import { UnauthorizedException } from '@nestjs/common';

const mockAuthService = () => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
});

const mockUser = {
  id: new ObjectId(),
  username: 'username',
  password: 'password',
  role: 'role',
  email: '123@abc.com',
  phoneNumber: '9123456789',
  country: 'abc',
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        //         UserRepository,
        //         JwtService,
        { provide: AuthService, useFactory: mockAuthService },
        //         // Other dependencies...
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a string when signUp is successful', async () => {
    const userDto: UserDto = {
      username: 'testuser',
      password: 'testpassword',
      role: 'user',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      country: 'TestCountry',
    };

    // Mock the behavior of the authService.signUp method to return a string
    authService.signUp.mockResolvedValue('User created successfully');

    // Call the signUp method of the controller
    const result = await controller.signUp(userDto);

    // Assert that the result is a string
    expect(result).toEqual('User created successfully');
  });

  it('should throw an error when signUp fails', async () => {
    const userDto: UserDto = {
      username: 'testuser',
      password: 'testpassword',
      role: 'user',
      email: 'test@example.com',
      phoneNumber: '1234567890',
      country: 'TestCountry',
    };

    // Mock the behavior of the authService.signUp method to throw an error
    authService.signUp.mockRejectedValue(new Error('User creation failed'));

    // Call the signUp method of the controller and expect it to throw an error
    await expect(controller.signUp(userDto)).rejects.toThrowError(
      'User creation failed',
    );
  });

  describe('signIn', () => {
    it('should return an access token', async () => {
      //   const user1 = { username: 'testuser', password: 'testpassword' };

      authService.signIn.mockResolvedValue({
        accessToken: 'testAccessToken',
      });

      expect(await controller.signIn(mockUser)).toEqual({
        accessToken: 'testAccessToken',
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authService.signIn.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.signIn(mockUser)).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });
});
