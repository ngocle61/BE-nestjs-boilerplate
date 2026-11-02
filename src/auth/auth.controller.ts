import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiDefaultResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { errorResponseSchema } from '../common/dto/error-response.dto.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { refreshTokenSchema, type RefreshTokenDto } from './dto/refresh-token.dto.js';
import { signInResponseSchema, type SignInResponseDto } from './dto/sign-in-response.dto.js';
import { signInSchema, type SignInDto } from './dto/sign-in.dto.js';
import { tokenPairSchema, type TokenPairDto } from './dto/token-pair.dto.js';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface.js';

@ApiDefaultResponse({ standardSchema: errorResponseSchema })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ standardSchema: signInResponseSchema })
  signIn(@Body({ schema: signInSchema }) dto: SignInDto): Promise<SignInResponseDto> {
    return this.authService.signIn(dto);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ standardSchema: tokenPairSchema })
  refreshToken(@Body({ schema: refreshTokenSchema }) dto: RefreshTokenDto): Promise<TokenPairDto> {
    return this.authService.refreshToken(dto);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  signOut(
    @CurrentUser() user: AuthenticatedUser,
    @Body({ schema: refreshTokenSchema }) dto: RefreshTokenDto,
  ): Promise<void> {
    return this.authService.signOut(user, dto);
  }
}
