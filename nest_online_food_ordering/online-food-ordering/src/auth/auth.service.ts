import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './Dto/user.dto';
import { JwtPayload } from './jwt-payload';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: UserDto): Promise<string> {
    this.logger.log(`User signed up successfully:`);
    return this.userRepository.createUser(authCredentialsDto);
  }
  async signIn(user: SignInDto): Promise<{ accessToken: string }> {
    const { username, password } = user;
    const getUser = await this.userRepository.findOne({ where: { username } });
    if (getUser && (await bcrypt.compare(password, getUser.password))) {
      const payload: JwtPayload = { username };
      const accessToken: string = await this.jwtService.sign(payload);
      this.logger.log(`User signed In successfully:`);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Please check your Login credentials');
    }
  }
}
