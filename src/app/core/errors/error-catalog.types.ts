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

export interface AppError {
  status: number;
  code: string;
  message: string;
  title: string;
  detail?: string;
  fieldErrors?: Record<string, string[]>;
}
