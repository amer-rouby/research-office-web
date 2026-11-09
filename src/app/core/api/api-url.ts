import { InjectionToken } from '@angular/core';
import { environment } from '@env/environment';

/** Base URL of the research-office-backend REST API (no trailing slash). */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl,
});
