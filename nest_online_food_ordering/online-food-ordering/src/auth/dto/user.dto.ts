import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsIn,
  IsNotEmpty,
} from 'class-validator';

export class UserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(15)
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password is weak',
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(['ADMIN', 'USER', 'DRIVER'], {
    message: 'Role must be either "ADMIN" or "USER" or "DRIVER"',
  })
  role?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[6,7,8,9]{1}[0-9]{9}$/, {
    message:
      'Phone Number should have only numbers, 10 digits and start with 6,7,8,9',
  })
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  country: string;
}
