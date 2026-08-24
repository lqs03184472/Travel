import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt-auth.guard';
import { AdoptPlanDto, AiPlanDto } from './dto/ai.dto';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  /** 生成三套规划方案 */
  @Post('plan')
  plan(@CurrentUser() user: JwtUser, @Body() dto: AiPlanDto) {
    return this.aiService.plan(user.userId, dto);
  }

  /** 一键采纳：将方案导入"我的行程" */
  @Post('adopt')
  adopt(@CurrentUser() user: JwtUser, @Body() dto: AdoptPlanDto) {
    return this.aiService.adopt(user.userId, dto);
  }
}
