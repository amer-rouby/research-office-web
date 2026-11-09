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
    super(problem.detail ?? problem.title ?? `HTTP ${status}`);
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
