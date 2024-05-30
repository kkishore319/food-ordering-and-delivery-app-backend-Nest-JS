import { ApiProperty } from '@nestjs/swagger';

export class CartItem {
  @ApiProperty()
  itemId: string;

  @ApiProperty()
  itemName: string;

  @ApiProperty()
  restaurantId: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;
}
