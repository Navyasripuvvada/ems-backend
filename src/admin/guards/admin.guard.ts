import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token is missing");
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      request["user"] = decoded;

      return true;
    } catch (error) {
      console.log('JWT ERROR =>', error);
      throw new UnauthorizedException("Invalid Token/Expired Token");
    }
  }
}