import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'readableDateTime',
  standalone: true,
})
export class ReadableDateTimePipe implements PipeTransform {
  transform(
    value: any,
    format: string = 'd MMMM y h:mm a', // Changed here: e.g., 6 May 2025
    locale: string = 'en-US'
  ): string | null {
    if (!value) return null;

    return formatDate(value, format, locale, 'UTC');
  }
}
