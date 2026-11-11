export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  code?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly detail?: string;
  readonly userMessage: string;
  readonly errors?: Record<string, string[]>;
  readonly problemDetails?: ProblemDetails;

  constructor(userMessage: string, status = 500, problemDetails?: ProblemDetails) {
    super(userMessage);
    this.name = 'ApiError';
    this.status = status;
    this.code = problemDetails?.code;
    this.detail = problemDetails?.detail;
    this.userMessage = userMessage;
    this.errors = problemDetails?.errors;
    this.problemDetails = problemDetails;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
