import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthDocument } from './auth.schema';

interface AuthRequest extends Request {
  user?: AuthDocument; // Optional user property
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthRequest = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.jwt; // Get token from cookies

    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      request.user = decoded; // Attach user data to request
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
