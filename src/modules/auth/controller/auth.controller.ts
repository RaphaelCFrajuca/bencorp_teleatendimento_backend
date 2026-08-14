import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from '../service/auth.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({
    summary: 'Autentica um usuário e retorna um token JWT',
    description:
      'Este endpoint permite que um usuário faça login no sistema fornecendo seu e-mail e senha. Se as credenciais forem válidas, o sistema retornará um token JWT que pode ser usado para autenticação em chamadas subsequentes.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login bem-sucedido, retorna token JWT e informações do usuário',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciais inválidas',
  })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }
}
