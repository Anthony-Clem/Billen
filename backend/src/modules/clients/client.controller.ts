import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ClientService } from './client.service';
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto } from './dtos/update-client.dto';
import { ClientDto } from './dtos/client.dto';
import { InviteDto } from './dtos/invite.dto';
import { OnboardDto } from './dtos/onboard.dto';
import { SessionGuard } from '@/common/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import type { ApiResponse } from '@/common/types/api-response';
import { TokenGuard } from '@/common/guards/token.guard';
import { InvitePayload } from '@/common/decorators/invite-payload.decorator';
import type { InvitePayload as InvitePayloadType } from '@/common/types/invite-payload';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  @UseGuards(SessionGuard)
  async findAll(@CurrentUser() user: User): Promise<ApiResponse<ClientDto[]>> {
    const clients = await this.clientService.findAll(user.id);
    return {
      data: plainToInstance(ClientDto, clients, {
        excludeExtraneousValues: true,
      }),
      message: 'Clients fetched successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @UseGuards(SessionGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<ClientDto>> {
    const client = await this.clientService.findOne(id, user.id);
    return {
      data: plainToInstance(ClientDto, client, {
        excludeExtraneousValues: true,
      }),
      message: 'Client fetched successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Post()
  @UseGuards(SessionGuard)
  async create(
    @Body() dto: CreateClientDto,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<ClientDto>> {
    const client = await this.clientService.create(user.id, dto);
    return {
      data: plainToInstance(ClientDto, client, {
        excludeExtraneousValues: true,
      }),
      message: 'Client created successfully',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Patch(':id')
  @UseGuards(SessionGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<ClientDto>> {
    const client = await this.clientService.update(id, user.id, dto);
    return {
      data: plainToInstance(ClientDto, client, {
        excludeExtraneousValues: true,
      }),
      message: 'Client updated successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @UseGuards(SessionGuard)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<null>> {
    await this.clientService.remove(id, user.id);
    return {
      data: null,
      message: 'Client deleted successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('invite')
  @UseGuards(SessionGuard)
  @HttpCode(HttpStatus.OK)
  async invite(
    @Body() dto: InviteDto,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<null>> {
    await this.clientService.sendInvite(user.id, dto);
    return {
      data: null,
      message: 'Invite sent successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Post('onboard')
  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.CREATED)
  async onboard(
    @Body() dto: OnboardDto,
    @InvitePayload() payload: InvitePayloadType,
  ): Promise<ApiResponse<ClientDto>> {
    const client = await this.clientService.onboard(dto, payload);
    return {
      data: plainToInstance(ClientDto, client, {
        excludeExtraneousValues: true,
      }),
      message: 'Client onboarded successfully',
      statusCode: HttpStatus.CREATED,
    };
  }
}
