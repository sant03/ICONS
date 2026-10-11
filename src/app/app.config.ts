import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // `withHashLocation()` keeps deep links working on static hosts without
    // any server-side rewrite rule (the original app was a single Vite page).
    provideRouter(routes, withHashLocation()),
  ],
};
