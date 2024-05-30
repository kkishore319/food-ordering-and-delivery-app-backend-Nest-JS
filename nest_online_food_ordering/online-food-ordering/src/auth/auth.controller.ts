import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from './Dto/user.dto';
import { SignInDto } from './dto/signin.dto';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');
  constructor(private authService: AuthService) {}

  @Post('/signUp')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'It will return the user in the response',
  })
  signUp(@Body() userDto: UserDto): Promise<string> {
    this.logger.log(`Post : User signed :${JSON.stringify(userDto)}`);
    return this.authService.signUp(userDto);
  }

  @Post('/signIn')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'It will give you the access_token in the response',
  })
  signIn(@Body() signInDto: SignInDto): Promise<{ accessToken: string }> {
    this.logger.log(`Post : User signIn :${JSON.stringify(signInDto)}`);
    return this.authService.signIn(signInDto);
  }
}
