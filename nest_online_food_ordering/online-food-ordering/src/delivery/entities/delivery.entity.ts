import { Order } from '../../order/entities/order.entity';
import { Column, Entity, ObjectIdColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Delivery {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  deliveryId: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  assigned?: boolean = false;

  @Column()
  order?: Order = null;
}
