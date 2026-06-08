export interface ApiResponse<T = unknown> {
  code?: number | string;
  msg?: string;
  data?: T;
  [key: string]: unknown;
}

export interface ListResponse<T> extends ApiResponse<T[] | T> {
  rows?: T[];
  total?: number | string;
}
