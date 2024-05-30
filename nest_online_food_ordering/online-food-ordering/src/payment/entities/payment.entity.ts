import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ObjectIdColumn, ObjectId } from 'typeorm';

@Entity()
export class Payment {
  @ObjectIdColumn()
  id?: ObjectId;

  @ApiProperty()
  @Column()
  transactionId: number;

  @ApiProperty()
  @Column()
  orderId: number;

  @ApiProperty()
  @Column()
  paymentDate: Date;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column()
  amount: number;

  @ApiProperty()
  @Column()
  transactionStatus: string;
}
