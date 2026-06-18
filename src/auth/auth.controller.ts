import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.services';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
  return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }
}