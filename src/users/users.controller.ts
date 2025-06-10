import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('by-email')
  getByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 50,
  ) {
    limit = Math.min(limit, 200);
    return this.usersService.findAll({ page, limit });
  }

  @Get('search')
  search(
    @Query('name') name: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 50,
  ) {
    limit = Math.min(limit, 200);
    return this.usersService.search(name, { page, limit });
  }

  @Put(':email')
  update(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(email, updateUserDto);
  }

  @Patch(':email/disable')
  disable(@Param('email') email: string) {
    return this.usersService.disable(email);
  }
}
