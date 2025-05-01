import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupAlertComponent } from './popup-alert.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    PopupAlertComponent
  ],
  exports:[
    PopupAlertComponent
  ],
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class PopupAlertModule { }
