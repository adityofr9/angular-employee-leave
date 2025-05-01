import { Component, Input, OnInit } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-crop-image',
  templateUrl: './crop-image.component.html',
  styleUrls: ['./crop-image.component.scss']
})
export class CropImageComponent implements OnInit {

  image: any = '';
  resultImage: any = '';
  ratio: any = 1 / 1;

  fileName: any = '';

  constructor(
    private ref: DynamicDialogRef,
    private dialog:DynamicDialogConfig,
    private helper: HelperService
  ) { }

  ngOnInit() {
    if (this.dialog.data) {
      this.image = this.dialog.data.image ?? '';
      this.fileName = this.dialog.data.image?.name ?? '';
      this.ratio = parseFloat(this.dialog.data.ratio ?? 1 / 1);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.resultImage = event;
  }

  cropImage(){
    let newFile;
    if (this.resultImage) {
      let blobData = this.resultImage.blob;
      newFile = new File([blobData], this.fileName, { type: blobData.type });
      this.ref.close(newFile);
    } else {
      this.ref.close();
      this.helper.showErrorAlert('', 'Failed to crop image, please try again!');
    }
  }

  onClose(){
    this.ref.close();
  }
}
