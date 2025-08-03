export interface ApiErrorResponse {
  error: string;
  issues?: { path: (string | number)[]; message: string }[];
}
