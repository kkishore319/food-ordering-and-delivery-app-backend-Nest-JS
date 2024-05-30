import { IsString, Length, Matches } from 'class-validator';
import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export class Order {
  @ObjectIdColumn()
  _id?: string;

  @PrimaryColumn()
  orderId?: number;

  @Column()
  orderDate?: Date;

  @Column()
  email?: string;

  @Column()
  orderStatus?: string;

  @Column()
  deliveryStatus?: string;

  @Column()
  orderDetails?: string[];

  @Column()
  @Matches(/^[6,7,8,9]{1}[0-9]{9}$/, {
    message:
      'Phone Number should have only numbers, 10 digits and start with 6,7,8,9',
  })
  phoneNumber?: string;

  @Column()
  cost?: number;

  @Column()
  @IsString()
  address?: string;

  @Column()
  @Length(6)
  pincode?: string;

  @Column()
  @IsString()
  city?: string;

  @Column()
  @IsString()
  state?: string;

  @Column({ nullable: true })
  orderInstructions?: string;

  @Column()
  deliveryPartnerAssigned?: boolean = false;
}
