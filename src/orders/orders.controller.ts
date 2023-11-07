import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { Role } from '../auth/decorators/role';
import { UserRole } from '../auth/enums/user-role.enum';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RoleGuard } from '../auth/guards/authorization.guard';
import { PaginatedOrders } from '../common/pagination/response';
import { OrderQueryDto } from '../common/query/order.query.dto';
import { CommentsCreateDto } from './dto/comments-create.dto';
import { OrderUpdateDto } from './dto/order-update.dto';
import { IOrderStatistic } from './inretfaces/order-statistic.interface';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Role(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Get()
  async getOrdersWithPagination(
    @Query() query: OrderQueryDto,
  ): Promise<PaginatedOrders> {
    return await this.ordersService.getOrdersWithPagination(query);
  }
  @Role(UserRole.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Get('/statistic')
  async getOrdersStatistics(): Promise<IOrderStatistic> {
    return await this.ordersService.getOrdersStatistics();
  }

  @Get('/excel')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename=exported-data.xlsx')
  async getExel(
    @Query() query: OrderQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const book = await this.ordersService.getExel(query);
    book.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  }

  @Patch(':orderId')
  async updateById(
    @Body() orderUpdateDto: OrderUpdateDto,
    @Param('orderId') orderId: string,
  ): Promise<any> {
    return await this.ordersService.updateById(orderUpdateDto, orderId);
  }

  @Post(':orderId/comments')
  async addComment(
    @Param('orderId') orderId: string,
    @Body() data: CommentsCreateDto,
  ) {
    return await this.ordersService.addComment(orderId, data);
  }
}
