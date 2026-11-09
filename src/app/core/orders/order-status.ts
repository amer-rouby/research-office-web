import type { OrderStatus, TimelineEntry } from '@core/api/api-types';

export type Tone = 'info' | 'warning' | 'success' | 'danger' | 'neutral';

interface StatusMeta {
  /** Name of the status everywhere in the UI. */
  readonly label: string;
  readonly tone: Tone;
  /** Staff button that moves a request INTO this status. */
  readonly action: string;
  /** What the client should know or do at this status. */
  readonly clientHint: string;
}

/** The single description of every status; screens never hardcode status text. */
export const STATUS: Record<OrderStatus, StatusMeta> = {
  NEW: {
    label: 'جديد',
    tone: 'info',
    action: 'إعادة فتح',
    clientHint: 'استلمنا طلبك ونراجعه الآن، وسيصلك عرض السعر قريبًا.',
  },
  QUOTED: {
    label: 'بانتظار قبول العرض',
    tone: 'warning',
    action: 'إرسال عرض سعر',
    clientHint: 'عرض السعر جاهز. راجعه واضغط قبول للبدء.',
  },
  ACCEPTED: {
    label: 'مقبول',
    tone: 'info',
    action: 'تسجيل قبول العرض',
    clientHint: 'تم قبول العرض، وسنبدأ العمل على طلبك.',
  },
  IN_PROGRESS: {
    label: 'قيد التنفيذ',
    tone: 'info',
    action: 'بدء التنفيذ',
    clientHint: 'المختص يعمل على طلبك الآن.',
  },
  IN_REVIEW: {
    label: 'مراجعة الجودة',
    tone: 'info',
    action: 'إرسال للمراجعة',
    clientHint: 'العمل في مرحلة المراجعة النهائية قبل التسليم.',
  },
  DELIVERED: {
    label: 'تم التسليم',
    tone: 'success',
    action: 'تسليم للعميل',
    clientHint: 'ملفاتك جاهزة للتحميل. أكّد الاستلام أو اطلب تعديلًا.',
  },
  REVISION: {
    label: 'طلب تعديل',
    tone: 'warning',
    action: 'فتح تعديل',
    clientHint: 'استلمنا طلب التعديل ونعمل عليه.',
  },
  CLOSED: {
    label: 'مكتمل',
    tone: 'neutral',
    action: 'إغلاق الطلب',
    clientHint: 'اكتمل طلبك. شكرًا لثقتك.',
  },
  CANCELLED: {
    label: 'ملغي',
    tone: 'danger',
    action: 'إلغاء الطلب',
    clientHint: 'تم إلغاء هذا الطلب.',
  },
};

export const ALL_STATUSES = Object.keys(STATUS) as OrderStatus[];

/** Client-facing journey: each status maps to one step. */
export const CLIENT_STEPS = [
  'استلام الطلب',
  'عرض السعر',
  'التنفيذ',
  'المراجعة',
  'التسليم',
  'الإغلاق',
];
const STEP_OF: Record<OrderStatus, number> = {
  NEW: 0,
  QUOTED: 1,
  ACCEPTED: 2,
  IN_PROGRESS: 2,
  REVISION: 2,
  IN_REVIEW: 3,
  DELIVERED: 4,
  CLOSED: 6,
  CANCELLED: -1,
};
export const stepOf = (status: OrderStatus) => STEP_OF[status];

/** One-line title of a timeline entry. */
export function timelineTitle(e: TimelineEntry): string {
  switch (e.type) {
    case 'CREATED':
      return 'تم استلام الطلب';
    case 'QUOTED':
      return 'عرض السعر';
    case 'NOTE':
      return 'ملاحظة';
    case 'FILE_ADDED':
      return 'ملفات مرفوعة';
    default:
      return e.toStatus ? STATUS[e.toStatus].label : 'تحديث';
  }
}
