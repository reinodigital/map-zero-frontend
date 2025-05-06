import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'readableDate',
  standalone: true,
})
export class ReadableDatePipe implements PipeTransform {
  transform(
    value: any,
    format: string = 'd MMMM y', // Changed here: e.g., 6 May 2025
    locale: string = 'en-US'
  ): string | null {
    if (!value) return null;

    return formatDate(value, format, locale, 'UTC');
  }
}
