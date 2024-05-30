import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers['authorization'];

    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      const token = authorizationHeader.split(' ')[1];
      try {
        const payload = await this.jwtService.verify(token);
        const user = await this.userRepository.findOne({
          where: { username: payload.username },
        });
        req.user = user;
      } catch (error) {
        // Handle invalid or expired tokens
        // console.error('Invalid or expired token:', error);
      }
    }

    next();
  }
}
