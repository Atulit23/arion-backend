import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto } from './dto/auth.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async register(@Body() body: signupDto, @Res() res: Response) {
    return this.authService.signup(body, res);
  }

  @Post('login')
  async login(@Body() body: signupDto, @Res() res: Response) {
    return this.authService.login(body, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getUserById')
  async getUserById(@Query('id') id: string, @Res() res: Response) {
    return this.authService.getUserById(id, res);
  }
}
