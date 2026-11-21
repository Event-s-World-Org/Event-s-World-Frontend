import { signal } from '@angular/core';
import { ConfigService } from '../../config';

/** Test double for the runtime configuration: only `apiUrl` matters to the interceptors. */
export const TEST_API_URL = 'https://api.test';

export function provideTestConfig() {
  return {
    provide: ConfigService,
    useValue: { apiUrl: TEST_API_URL, config: signal({ apiUrl: TEST_API_URL }) },
  };
}
