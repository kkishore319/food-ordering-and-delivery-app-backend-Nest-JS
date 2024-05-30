import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ObjectId } from 'mongodb';
import { UserRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import * as bcrypt from 'bcrypt';
import { User } from './entities/auth.entity';

const mockUserRepository = () => ({
  createUser: jest.fn(),
  findOne: jest.fn(),
});
const mockJwtService = () => ({
  sign: jest.fn(),
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

describe('AuthService', () => {
  let service: AuthService;
  let userRepository;
  let jwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    service = module.get(AuthService);
    userRepository = module.get(UserRepository);
    jwtService = module.get(JwtService);
  });

  describe('signUP', () => {
    it('should return string  after signup', async () => {
      const usr: User = {
        id: new ObjectId(),
        username: 'testuser',
        password: 'password123',
        role: 'user',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        country: 'USA',
      };
      userRepository.createUser.mockResolvedValue(
        `User with username ${usr.username} is created.`,
      );
      const result = await service.signUp(usr);
      expect(result).toEqual(`User with username ${usr.username} is created.`);
    });
  });
  describe('signIn', () => {
    it('should throw UnauthorizedException when credentials are incorrect', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.signIn(mockUser)).rejects.toThrow(
        new UnauthorizedException('Please check your Login credentials'),
      );
    });
    it('should return an access token when credentials are correct', async () => {
      const hashedPassword = 'hashedPassword'; // Mock hashed password
      const user: User = {
        id: new ObjectId(),
        username: 'testuser',
        password: 'password123',
        role: 'user',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        country: 'USA',
      };

      userRepository.findOne.mockResolvedValue({
        ...user,
        password: hashedPassword,
      });
      // Mock the behavior of bcrypt.compare to return true
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      // Mock the behavior of jwtService.sign to return a fake access token
      jwtService.sign.mockReturnValue('fakeAccessToken');

      // Call the signIn method with the user object
      const result = await service.signIn(user);

      // Expect the result to contain the fake access token
      expect(result.accessToken).toEqual('fakeAccessToken');
    });
  });
});
