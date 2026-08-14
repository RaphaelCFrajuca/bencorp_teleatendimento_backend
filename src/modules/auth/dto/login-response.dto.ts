import { ApiProperty } from '@nestjs/swagger';

class LoginResponseUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: LoginResponseUserDto;
}
