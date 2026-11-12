/** Every backend route starts with this prefix (backend.md §4). */
export const API_PREFIX = '/api/';

/** True when the request goes to our backend (after the base URL interceptor ran). */
export function isApiRequest(url: string, apiUrl: string): boolean {
  return url.startsWith(`${apiUrl}${API_PREFIX}`);
}

/** Path of an API request without the origin, e.g. `/api/v1/participant/registration`. */
export function apiPath(url: string, apiUrl: string): string {
  return isApiRequest(url, apiUrl) ? url.slice(apiUrl.length) : url;
}
