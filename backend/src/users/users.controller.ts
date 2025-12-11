import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateWhatsappMessagesDto } from './dto/update-whatsapp-messages.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    const userData = await this.usersService.findById(user.userId);
    const { password, ...result } = userData.toObject();
    return result;
  }

  @Put('me')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(user.userId, updateUserDto);
    const { password, ...result } = updatedUser.toObject();
    return result;
  }

  @Put('me/password')
  async updatePassword(
    @CurrentUser() user: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(user.userId, updatePasswordDto);
    return { message: 'Senha atualizada com sucesso' };
  }

  @Put('me/whatsapp-messages')
  async updateWhatsappMessages(
    @CurrentUser() user: any,
    @Body() updateMessagesDto: UpdateWhatsappMessagesDto,
  ) {
    const updatedUser = await this.usersService.updateWhatsappMessages(
      user.userId,
      updateMessagesDto,
    );
    const { password, ...result } = updatedUser.toObject();
    return result;
  }
}

