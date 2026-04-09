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
import { InvoiceService } from './invoice.service';
import { PdfService } from './pdf.service';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { UpdateInvoiceDto } from './dtos/update-invoice.dto';
import { InvoiceDto } from './dtos/invoice.dto';
import { SessionGuard } from '@/common/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { EmailService } from '@/common/email/email.service';
import { ClientService } from '../clients/client.service';
import type { ApiResponse } from '@/common/types/api-response';

@Controller('invoices')
@UseGuards(SessionGuard)
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
    private readonly clientService: ClientService,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: User,
  ): Promise<ApiResponse<InvoiceDto[]>> {
    const invoices = await this.invoiceService.findAll(user.id);
    return {
      data: plainToInstance(InvoiceDto, invoices, {
        excludeExtraneousValues: true,
      }),
      message: 'Invoices fetched successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Get('client/:clientId')
  async findByClient(
    @Param('clientId') clientId: string,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<InvoiceDto[]>> {
    const invoices = await this.invoiceService.findByClient(clientId, user.id);
    return {
      data: plainToInstance(InvoiceDto, invoices, {
        excludeExtraneousValues: true,
      }),
      message: 'Invoices fetched successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<InvoiceDto>> {
    const invoice = await this.invoiceService.findOne(user.id, id);
    return {
      data: plainToInstance(InvoiceDto, invoice, {
        excludeExtraneousValues: true,
      }),
      message: 'Invoice fetched successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Post()
  async create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<InvoiceDto>> {
    const invoice = await this.invoiceService.create(user.id, dto);
    return {
      data: plainToInstance(InvoiceDto, invoice, {
        excludeExtraneousValues: true,
      }),
      message: 'Invoice created successfully',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<InvoiceDto>> {
    const invoice = await this.invoiceService.update(id, user.id, dto);
    return {
      data: plainToInstance(InvoiceDto, invoice, {
        excludeExtraneousValues: true,
      }),
      message: 'Invoice updated successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<null>> {
    await this.invoiceService.remove(id, user.id);
    return {
      data: null,
      message: 'Invoice deleted successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  async send(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<InvoiceDto>> {
    const invoice = await this.invoiceService.findOne(user.id, id);
    const client = await this.clientService.findOne(invoice.clientId, user.id);

    const pdfBase64 = this.pdfService.generate(invoice, client.name);

    await this.emailService.sendInvoice(
      client.email,
      invoice.invoiceNumber,
      pdfBase64,
    );

    const updated = await this.invoiceService.markSent(id, user.id);

    return {
      data: plainToInstance(InvoiceDto, updated, {
        excludeExtraneousValues: true,
      }),
      message: 'Invoice sent successfully',
      statusCode: HttpStatus.OK,
    };
  }
}
