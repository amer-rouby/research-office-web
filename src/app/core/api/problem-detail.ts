import { HttpErrorResponse } from '@angular/common/http';

/** RFC 9457 problem details, as returned by the Spring backend. */
export interface ProblemDetail {
  readonly type?: string;
  readonly title?: string;
  readonly status?: number;
  readonly detail?: string;
  readonly instance?: string;
  /** Stable machine-readable error code from the backend (e.g. BAD_CREDENTIALS, VALIDATION). */
  readonly code?: string;
  /** Field-level validation errors (backend extension), keyed by field name. */
  readonly fields?: Readonly<Record<string, string>>;
  readonly [extension: string]: unknown;
}

/** The single error type every API call fails with. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly problem: ProblemDetail,
  ) {
    super(arabicMessage(status, problem));
    this.name = 'ApiError';
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }
}

/** User-facing text for each backend error code (backend details stay English for logs). */
const CODE_TEXT: Record<string, string> = {
  BAD_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  BAD_REFRESH_TOKEN: 'انتهت الجلسة، سجّل الدخول مرة أخرى.',
  VALIDATION: 'راجع البيانات المدخلة.',
  NOT_FOUND: 'العنصر المطلوب غير موجود.',
  INVALID_TRANSITION: 'لا يمكن نقل الطلب لهذه المرحلة الآن.',
  SERVICE_UNAVAILABLE: 'هذه الخدمة غير متاحة حاليًا.',
  FILE_EMPTY: 'الملف فارغ.',
  FILE_TOO_LARGE: 'حجم الملف أكبر من 50 ميجا.',
  FILE_TYPE_NOT_ALLOWED: 'نوع الملف غير مسموح.',
  NO_FILES: 'أرفق ملفًا واحدًا على الأقل.',
  ORDER_CLOSED: 'هذا الطلب مغلق.',
  USE_QUOTE: 'استخدم نموذج عرض السعر لإرسال السعر.',
  INVALID_FILE_KIND: 'نوع الرفع غير صحيح.',
  EXPERT_UNAVAILABLE: 'اختر خبيرًا نشطًا.',
  FILE_NOT_INTERNAL: 'هذا الملف ظاهر للعميل بالفعل.',
  EMAIL_TAKEN: 'هذا البريد مستخدم لحساب آخر.',
  CANNOT_DEACTIVATE_SELF: 'لا يمكنك إيقاف حسابك.',
  NO_QUOTE: 'أرسل عرض السعر أولًا قبل تسجيل الدفعات.',
  NO_WORK_FILES: 'ارفع ملف العمل أولًا قبل الإرسال للمراجعة.',
  NO_DELIVERABLES: 'أرسل ملفًا واحدًا على الأقل للعميل قبل التسليم.',
  PAYMENT_EXCEEDS_BALANCE: 'المبلغ أكبر من المتبقي على العميل.',
};

const STATUS_TEXT: Record<number, string> = {
  400: 'البيانات المدخلة غير صحيحة.',
  401: 'انتهت الجلسة، سجّل الدخول مرة أخرى.',
  403: 'ليس لديك صلاحية لهذا الإجراء.',
  404: 'العنصر المطلوب غير موجود.',
  409: 'تعارض في البيانات، حدّث الصفحة وحاول مرة أخرى.',
  413: 'حجم الملفات أكبر من المسموح.',
  422: 'لا يمكن تنفيذ هذا الإجراء الآن.',
  500: 'حدث خطأ في الخادم، حاول بعد قليل.',
};

function arabicMessage(status: number, problem: ProblemDetail): string {
  if (status === 0) return problem.detail ?? problem.title ?? '';
  return (
    (problem.code && CODE_TEXT[problem.code]) ||
    STATUS_TEXT[status] ||
    (status >= 500 ? STATUS_TEXT[500] : 'حدث خطأ غير متوقع، حاول مرة أخرى.')
  );
}

const NETWORK_PROBLEM: ProblemDetail = {
  title: 'تعذّر الاتصال بالخادم',
  detail: 'تحقّق من الاتصال بالإنترنت ثم حاول مرة أخرى.',
  status: 0,
};

function isProblemDetail(body: unknown): body is ProblemDetail {
  return (
    typeof body === 'object' &&
    body !== null &&
    ('title' in body || 'detail' in body || 'type' in body)
  );
}

/** Maps any HttpClient failure to an {@link ApiError}. */
export function toApiError(error: HttpErrorResponse): ApiError {
  if (error.status === 0) {
    return new ApiError(0, NETWORK_PROBLEM);
  }
  const problem: ProblemDetail = isProblemDetail(error.error)
    ? error.error
    : { title: error.statusText || 'خطأ غير متوقع', status: error.status };
  return new ApiError(error.status, { ...problem, status: problem.status ?? error.status });
}
