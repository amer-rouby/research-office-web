import { Pipe, PipeTransform } from '@angular/core';

/** Arabic text with Latin digits: easier to read for prices, phones and dates across the Gulf. */
const LOCALE = 'ar-u-nu-latn';
const DATE = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' });
const DATE_TIME = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' });

export const formatDate = (iso?: string | null) => (iso ? DATE.format(new Date(iso)) : '—');
export const formatDateTime = (iso?: string | null) =>
  iso ? DATE_TIME.format(new Date(iso)) : '—';
export const formatMoney = (q?: { price: number; currency: string } | null) =>
  q
    ? new Intl.NumberFormat(LOCALE, { style: 'currency', currency: q.currency }).format(q.price)
    : '—';
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

@Pipe({ name: 'roDate' })
export class DatePipe implements PipeTransform {
  transform = formatDate;
}

@Pipe({ name: 'roDateTime' })
export class DateTimePipe implements PipeTransform {
  transform = formatDateTime;
}

@Pipe({ name: 'roMoney' })
export class MoneyPipe implements PipeTransform {
  transform = formatMoney;
}

@Pipe({ name: 'roBytes' })
export class BytesPipe implements PipeTransform {
  transform = formatBytes;
}
