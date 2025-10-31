import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get all users (with selected fields)
  @Get()
  findAll() {
    return this.userService.findAll();
  }
  
  @Get('lodge/:lodge_id')
  findByLodgeId(@Param('lodge_id', ParseIntPipe) lodge_id: number) {
    return this.userService.findByLodgeId(lodge_id);
  }

  // Get one user by composite key
  @Get(':user_id/:lodge_id')
  findOne(
    @Param('user_id') user_id: string,
    @Param('lodge_id', ParseIntPipe) lodge_id: number,
  ) {
    return this.userService.findOne(BigInt(user_id), lodge_id);
  }
}
