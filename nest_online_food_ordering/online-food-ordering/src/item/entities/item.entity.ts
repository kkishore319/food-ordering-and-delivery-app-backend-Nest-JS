import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ObjectIdColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Items {
  @ObjectIdColumn()
  _id: string;

  @ApiProperty()
  @PrimaryColumn('uuid')
  itemId: string;

  @ApiProperty()
  @Column()
  restaurantId: string;

  @ApiProperty()
  @Column()
  itemName: string;

  @ApiProperty()
  @Column()
  category: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column()
  price: number;
}
