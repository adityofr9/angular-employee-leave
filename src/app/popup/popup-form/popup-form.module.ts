import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupFormComponent } from './popup-form.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [PopupFormComponent],
  exports: [PopupFormComponent]
})
export class PopupFormModule { }
