import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropFileUploadDirective } from './drop-file-upload.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [DropFileUploadDirective],
  exports:[DropFileUploadDirective]
})
export class DirectiveSharedModule { }
