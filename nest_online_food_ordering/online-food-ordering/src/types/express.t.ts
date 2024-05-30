/* eslint-disable @typescript-eslint/no-namespace */
import { User } from 'src/auth/entities/auth.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
