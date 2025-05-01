import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertErrorInputComponent } from './alert-error-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [AlertErrorInputComponent],
  exports:[AlertErrorInputComponent]
})
export class AlertErrorInputModule { }
