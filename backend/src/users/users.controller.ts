import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: JwtUser) {
    return this.usersService.getProfile(user.userId);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: JwtUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Get('me/stats')
  getStats(@CurrentUser() user: JwtUser) {
    return this.usersService.getStats(user.userId);
  }

  @Get('me/favorites')
  listFavorites(@CurrentUser() user: JwtUser) {
    return this.usersService.listFavorites(user.userId);
  }

  @Post('me/favorites/:tripId')
  toggleFavorite(@CurrentUser() user: JwtUser, @Param('tripId') tripId: string) {
    return this.usersService.toggleFavorite(user.userId, tripId);
  }

  @Delete('me/favorites/:tripId')
  removeFavorite(@CurrentUser() user: JwtUser, @Param('tripId') tripId: string) {
    return this.usersService.toggleFavorite(user.userId, tripId);
  }
}
