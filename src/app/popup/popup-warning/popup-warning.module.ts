import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupWarningComponent } from './popup-warning.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [PopupWarningComponent],
  exports: [PopupWarningComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PopupWarningModule { }
