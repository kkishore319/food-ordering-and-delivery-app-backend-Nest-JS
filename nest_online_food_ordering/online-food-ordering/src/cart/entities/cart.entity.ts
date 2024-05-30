import { Column, Entity, ObjectIdColumn, PrimaryColumn } from 'typeorm';
import { CartItem } from '../dto/cartItem.dto';

@Entity()
export class Cart {
  @ObjectIdColumn()
  _id?: string;

  @PrimaryColumn()
  cartId?: string;

  @Column()
  items?: CartItem[];

  @Column()
  username?: string;

  @Column()
  totalPrice?: number;
}
