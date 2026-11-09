import type { OrderSummary } from '@core/api/api-types';
import { Column } from '@shared/data-table/data-table';
import { formatDate, formatMoney } from '@shared/pipes/format.pipes';

/** Columns of every request table (list page and dashboard). `status` has a custom badge cell. */
export const ORDER_COLUMNS: readonly Column<OrderSummary>[] = [
  {
    key: 'reference',
    header: 'الرقم',
    value: (o) => o.reference,
    class: 'whitespace-nowrap font-medium',
  },
  { key: 'client', header: 'العميل', value: (o) => o.clientName },
  { key: 'service', header: 'الخدمة', value: (o) => o.serviceName, class: 'hidden md:table-cell' },
  { key: 'status', header: 'الحالة' },
  {
    key: 'quote',
    header: 'السعر',
    value: (o) => formatMoney(o.quote),
    class: 'hidden lg:table-cell',
  },
  {
    key: 'deadline',
    header: 'التسليم',
    value: (o) => formatDate(o.deadline),
    class: 'hidden lg:table-cell',
  },
  {
    key: 'created',
    header: 'تاريخ الطلب',
    value: (o) => formatDate(o.createdAt),
    class: 'hidden sm:table-cell',
  },
];
