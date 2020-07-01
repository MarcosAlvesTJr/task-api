import { PipeTransform, BadRequestException } from '@nestjs/common';
import { TaskStatus } from './../task-status.enum';

export class TaskStatusValidationPipe implements PipeTransform {
  readonly allowedStatus = [
    TaskStatus.DONE,
    TaskStatus.IN_PROGRESS,
    TaskStatus.OPEN,
  ];

  transform(value: string): string {
    value = value.toUpperCase();

    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`${value} é um status inválido.`);
    }

    return value;
  }

  private isStatusValid(status: any): boolean {
    const index = this.allowedStatus.indexOf(status);
    return index !== -1;
  }
}
