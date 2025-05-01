import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './file-upload.component';
import { DirectiveSharedModule } from 'src/app/core/directive/directive.module';
import { PrimengModule } from '../../library/primeng.module';
import { CropImageModule } from '../crop-image/crop-image.module';

@NgModule({
  imports: [
    CommonModule,
    DirectiveSharedModule,
    PrimengModule,
    CropImageModule
  ],
  declarations: [FileUploadComponent],
  exports:[FileUploadComponent]
})
export class FileUploadModule { }
