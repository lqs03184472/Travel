import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt-auth.guard';
import { CreateTripDto, SaveStepsDto, UpdateTripDto } from './dto/trip.dto';
import { TripsService } from './trips.service';

@Controller('trips')
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateTripDto) {
    return this.tripsService.create(user.userId, dto);
  }

  @Get('mine')
  listMine(@CurrentUser() user: JwtUser) {
    return this.tripsService.listMine(user.userId);
  }

  @Get('public')
  listPublic(@Query('keyword') keyword?: string) {
    return this.tripsService.listPublic(keyword);
  }

  @Get(':id')
  getOne(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.tripsService.getOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateTripDto,
  ) {
    return this.tripsService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.tripsService.remove(user.userId, id);
  }

  @Put(':id/steps')
  saveSteps(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: SaveStepsDto,
  ) {
    return this.tripsService.saveSteps(user.userId, id, dto.steps);
  }

  @Post(':id/copy')
  copy(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.tripsService.copy(user.userId, id);
  }
}
