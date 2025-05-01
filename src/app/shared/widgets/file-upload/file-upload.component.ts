import { DialogService } from 'primeng/dynamicdialog';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';
import { CropImageComponent } from '../crop-image/crop-image.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {
  @Input() multiple = false;
  @Input() type_file = 'image';
  @Input() showImage = false;

  @Input() allowedImageTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];
  @Input() allowedVideoTypes = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/quicktime',
  ];
  @Input() allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  @Input() accept_file = 'image/*';

  @Input() maxFiles!: number;
  max: number = 1;

  @Input() maxSizeImage: number = 1; // in MB
  @Input() maxSizeVideo: number = 1; // in MB
  @Input() maxSizeDocument: number = 1; // in MB
  maxImageSize = 1048576; // in bytes
  maxVideoSize = 1048576; // in bytes
  maxDocumentSize = 1048576; // in bytes

  @Input() message!: string;

  @Input() isCrop: boolean = true;
  @Input() ratio: any = 1 / 1;

  @Input() mediaList: any[] = [];

  @ViewChild('inputEl', { static: false }) inputEl!: ElementRef;

  @Output() onValueChange = new EventEmitter<any>();

  listFile: any[] = [];

  constructor(
    private helper: HelperService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.maxImageSize *= this.maxSizeImage;
    this.maxVideoSize *= this.maxSizeVideo;
    this.maxDocumentSize *= this.maxSizeDocument;

    if (this.multiple) {
      this.max = this.maxFiles || 20;
    }

    this.listFile = this.mediaList;
  }

  async dropFile(event: any) {
    const files: FileList = event?.target?.files
      ? Array.from(event.target.files)
      : event;

    for (let i = 0; i < files.length; i++) {
      await this.addFile(files[i]);
    }
    // this.addFile(files[0]);
  }

  async addFile(data_file: any) {
    const file = data_file;
    const fileName = file?.name;
    const fileSizeInBytes = file?.size;
    const fileType = file?.type; // file?.name.split('.').pop();
    const fileExtension =
      (this.type_file == 'document'
        ? 'application'
        : this.type_file == 'media'
        ? fileType?.split('/')[0]
        : this.type_file
      ) + '/' + fileName?.split('.').pop();

    // MARK: Check file type IMAGE
    if (
      this.type_file === 'image' &&
      (!this.allowedImageTypes.includes(fileType) ||
        !this.allowedImageTypes.includes(fileExtension))
    ) {
      this.helper.showErrorAlert(
        'Sorry',
        `Failed to upload ${fileName} (File type is not supported).`
      );
      return;
    }

    // MARK: Check file type VIDEO
    if (
      this.type_file === 'video' &&
      (!this.allowedVideoTypes.includes(fileType) ||
        !this.allowedVideoTypes.includes(fileExtension))
    ) {
      this.helper.showErrorAlert(
        'Sorry',
        `Failed to upload ${fileName} (File type is not supported).`
      );
      return;
    }

    // MARK: Check file type DOCUMENT
    if (
      this.type_file === 'document' &&
      (!this.allowedDocumentTypes.includes(fileType) ||
        !this.allowedDocumentTypes.includes(fileExtension))
    ) {
      this.helper.showErrorAlert(
        'Sorry',
        `Failed to upload ${fileName} (File type is not supported).`
      );
      return;
    }

    // MARK: Check file type MEDIA
    if (
      this.type_file === 'media' &&
      ((!this.allowedImageTypes.includes(fileType) ||
        !this.allowedImageTypes.includes(fileExtension)) &&
        (!this.allowedVideoTypes.includes(fileType) ||
        !this.allowedVideoTypes.includes(fileExtension)) &&
        (!this.allowedDocumentTypes.includes(fileType) ||
        !this.allowedDocumentTypes.includes(fileExtension)))
    ) {
      this.helper.showErrorAlert(
        'Sorry',
        `Failed to upload ${fileName} (File type is not supported).`
      );
      return;
    }

    const typeMedia = this.helper.getTypeMedia(fileName);
    const tmpMaxSize =
      typeMedia === 'image'
        ? this.maxImageSize
        : typeMedia === 'video'
        ? this.maxVideoSize
        : this.maxDocumentSize;
    if (fileSizeInBytes > tmpMaxSize) {
      this.helper.showErrorAlert(
        'Sorry',
        `Failed to upload ${fileName} (Maximum file size ${this.formatFileSize(
          tmpMaxSize
        )}).`
      );
      return;
    }

    let data: any = {
      name: file.name,
      size: this.formatFileSize(fileSizeInBytes),
      file: file,
      type: this.allowedImageTypes.includes(fileType)
        ? 'image'
        : this.allowedVideoTypes.includes(fileType)
        ? 'video'
        : 'document',
    };

    // MARK: Crop image
    if ((this.type_file === 'image' || typeMedia === 'image') && this.isCrop) {
      let croper = this.dialogService.open(CropImageComponent, {
        width: '80%',
        contentStyle: {
          // 'overflow': 'visible'
        },
        data: {
          ratio: this.ratio,
          image: file,
        },
      });

      let croppedImage: any;
      if (croper) {
        await firstValueFrom(croper.onClose).then((res) => {
          if (res) {
            croppedImage = res;
          }
        });

        if (croppedImage) {
          data.file = croppedImage;
          data.name = croppedImage.name;
        } else {
          croper?.destroy();
          return;
        }
      }
      croper?.destroy();
    }

    if (data.type === 'image') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        data.preview = e.target.result;
      };
      reader.readAsDataURL(data.file);
    } else if (data.type === 'video') {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.controls = true;

      video.onloadeddata = () => {
        console.log('Video has successfully loaded.');
      };

      video.onended = () => {
        URL.revokeObjectURL(video.src);
        console.log('Object URL revoked after video playback.');
      };

      data.preview = video;
    }

    // MARK: Check if multiple files
    if (this.multiple) {
      if (this.listFile.length >= this.max) {
        this.helper.showErrorAlert(
          'Sorry',
          `Failed to upload ${fileName} (Maximum file upload is ${this.max}).`
        );
        return;
      } else {
        this.listFile.push(data);
      }
    } else {
      this.listFile = [data];
    }

    this.onValueChange.emit(this.listFile);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  removeFile(index: number, id?: any) {
    this.listFile.splice(index, 1);
    this.onValueChange.emit(this.listFile);
  }

  clearFile() {
    this.listFile = [];
    this.onValueChange.emit(this.listFile);
  }

  tiggerOut() {
    this.inputEl.nativeElement.click();
  }
}
