import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class SetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  password: string;

  @IsString()
  @MinLength(8)
  confirmPassword: string;
}3

