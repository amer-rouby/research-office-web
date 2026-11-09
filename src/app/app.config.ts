import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
} from '@angular/router';
import { apiInterceptor } from '@core/api/api.interceptor';
import { SiteTitleStrategy } from '@core/site/seo';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      // child pages receive parent params (e.g. :token) as inputs
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      // landing links like /#services scroll to their section; new pages start at the top
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideHttpClient(withFetch(), withInterceptors([apiInterceptor])),
    { provide: TitleStrategy, useClass: SiteTitleStrategy },
  ],
};
