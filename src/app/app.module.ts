import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Diperlukan untuk animasi Toast
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { JwtInterceptor } from './core/interceptor/jwt.interceptor';
import { ErrorInterceptor } from './core/interceptor/error.interceptor';
import { NgxPermissionsModule } from 'ngx-permissions';
import { CoreModule } from './core/core.module';
import { LibaryModule } from './shared/library/library.module';

// perfect-scrollbar
// import { NgScrollbarModule } from 'ngx-scrollbar';

// i18n
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// store
import { StoreModule } from '@ngrx/store';
import { indexReducer } from './shared/store/index.reducer';
import { TitleStrategy } from '@angular/router';
import { RoutesService } from './services/routes.service';
import { registerLocaleData } from '@angular/common';
import localeId from '@angular/common/locales/id';

registerLocaleData(localeId, 'id');

// Factory function for dynamic path based on base href
export function httpTranslateLoader(http: HttpClient) {
  const baseHref =
    document.getElementsByTagName('base')[0].getAttribute('href') || '/';
  return new TranslateHttpLoader(http, `${baseHref}assets/i18n/`, '.json');
}

@NgModule({ declarations: [
        AppComponent,
        // Komponen Anda lainnya
    ], // Tambahkan MessageService ke dalam providers
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA], imports: [BrowserModule,
        AppRoutingModule,
        // NgScrollbarModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpTranslateLoader,
                deps: [HttpClient],
            },
        }),
        StoreModule.forRoot({ index: indexReducer }),
        NgxPermissionsModule.forRoot(),
        BrowserAnimationsModule, // Tambahkan ini untuk mendukung animasi toast
        // core & library
        CoreModule,
        LibaryModule], providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        {
            provide: TitleStrategy,
            useClass: RoutesService,
        },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {}
