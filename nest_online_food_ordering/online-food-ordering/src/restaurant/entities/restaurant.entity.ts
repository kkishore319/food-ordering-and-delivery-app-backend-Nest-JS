import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ObjectIdColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Restaurant {
  @ObjectIdColumn()
  _id: string;

  @ApiProperty()
  @PrimaryColumn('uuid')
  restaurantId: string;

  @ApiProperty()
  @Column()
  restaurantName: string;

  @ApiProperty()
  @Column()
  type: string;

  @ApiProperty()
  @Column()
  rating: number;

  @ApiProperty()
  @Column()
  location: string;
}
