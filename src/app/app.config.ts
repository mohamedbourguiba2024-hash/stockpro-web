import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { frPaginatorIntl } from './core/fr-paginator';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: MatPaginatorIntl, useFactory: frPaginatorIntl },
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
};
