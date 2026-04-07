import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Repository } from 'typeorm';
import { CreateInvoiceDto } from './dtos/create-invoice.dto';
import { UpdateInvoiceDto } from './dtos/update-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice) private readonly repository: Repository<Invoice>,
  ) {}

  findAll(userId: string) {
    return this.repository.find({
      where: { userId },
    });
  }

  async findOne(userId: string, id: string) {
    const invoice = await this.repository.findOne({
      where: {
        userId,
        id,
      },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async findByClient(clientId: string, userId: string) {
    return this.repository.find({
      where: {
        clientId,
        userId,
      },
    });
  }

  create(userId: string, dto: CreateInvoiceDto) {
    const invoice = this.repository.create({
      userId,
      ...dto,
      lineItems: dto.lineItems.map((item) => ({
        description: item.description,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.unitPrice * item.quantity,
      })),
    });
    return this.repository.save(invoice);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.findOne(userId, id);

    if (dto.invoiceNumber !== undefined)
      invoice.invoiceNumber = dto.invoiceNumber;
    if (dto.status !== undefined) invoice.status = dto.status;
    if (dto.amount !== undefined) invoice.amount = dto.amount;
    if (dto.currency !== undefined) invoice.currency = dto.currency;
    if (dto.issueDate !== undefined) invoice.issueDate = dto.issueDate;
    if (dto.dueDate !== undefined) invoice.dueDate = dto.dueDate;
    if (dto.pdfUrl !== undefined) invoice.pdfUrl = dto.pdfUrl ?? null;
    if (dto.notes !== undefined) invoice.notes = dto.notes ?? null;
    if (dto.lineItems !== undefined) {
      invoice.lineItems = dto.lineItems.map((item) => ({
        description: item.description,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.unitPrice * item.quantity,
      }));
    }

    return this.repository.save(invoice);
  }

  async remove(id: string, userId: string) {
    const invoice = await this.findOne(userId, id);
    await this.repository.remove(invoice);
  }
}
