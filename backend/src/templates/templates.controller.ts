import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt-auth.guard';
import { TemplatesService } from './templates.service';

@Controller('templates')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  list() {
    return this.templatesService.list();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.templatesService.getOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/apply')
  apply(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.templatesService.apply(user.userId, id);
  }
}
