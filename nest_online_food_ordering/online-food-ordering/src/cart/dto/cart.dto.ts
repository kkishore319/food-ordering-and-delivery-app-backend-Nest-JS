import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CartDto {
  @ApiProperty()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty()
  @IsNotEmpty()
  cartId: string;
}
