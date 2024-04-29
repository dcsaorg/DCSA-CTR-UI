import {APP_INITIALIZER, ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {Globals} from './models/globals';
import {ConfigService} from './services/config.service';
import {provideHttpClient} from '@angular/common/http';
import {ConfirmationService, MessageService} from 'primeng/api';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';


export function ConfigLoader(configService: ConfigService) {
  return () => configService.load();
}


export const appConfig: ApplicationConfig = {
  providers: [
    ConfigService,
    MessageService,
    ConfirmationService,
    importProvidersFrom([BrowserAnimationsModule]),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigLoader,
      deps: [ConfigService],
      multi: true
    },
    Globals,
    provideRouter(routes)
  ]
};
