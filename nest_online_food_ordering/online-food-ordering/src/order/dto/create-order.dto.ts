import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class CreateOrder {
  orderId?: number;

  orderDate?: Date;

  email?: string;

  orderStatus?: string;

  deliveryStatus?: string;

  orderDetails?: string[];

  @ApiProperty()
  @Matches(/^[6,7,8,9]{1}[0-9]{9}$/, {
    message:
      'Phone Number should have only numbers, 10 digits and start with 6,7,8,9',
  })
  phoneNumber?: string;

  @ApiProperty()
  @IsString()
  address?: string;

  @ApiProperty()
  @Length(6)
  pincode?: string;

  @ApiProperty()
  @IsString()
  city?: string;

  cost?: number;

  @ApiProperty()
  @IsString()
  state?: string;

  @ApiProperty()
  orderInstructions?: string;

  deliveryPartnerAssigned?: boolean = false;
}
