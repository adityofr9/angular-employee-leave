import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { HelperService } from 'src/app/services/helper.service';
import { FileUploadComponent } from 'src/app/shared/widgets/file-upload/file-upload.component';

@Component({
  selector: 'app-popup-banner',
  templateUrl: './popup-banner.component.html',
  styleUrls: ['./popup-banner.component.scss']
})
export class PopupBannerComponent implements OnInit {
  endpoint: any = events_endpoint.events;

  forms!: FormGroup;
  mode: string = 'create';
  isLoading: boolean = false;

  id:any;
  data: any;

  media: any;
  mediaOpt: any = {
    multiple: false,
    accept: 'image/*',
    type_file: 'image',
    maxFileSize: 5000000,
    message: '',
    ratio: '1 / 1',
    maxSizeImage: 25,
    maxSizeVideo: 200,
  };

  mediatemp: any[] = [];

  isErrorMaxSplash: boolean = false;

  @ViewChild(FileUploadComponent) fileuploadComponent!: FileUploadComponent;

  positions: any = [
    { name: 'Splash Banner (9:16)', value: 'splash' },
    { name: 'Topline Banner (16:9)', value: 'topline' },
    { name: 'Video Banner (16:9)', value: 'video'}
  ]

  isShowUrl: boolean = false;

  constructor(
    private api: EventsService,
    private helper: HelperService,
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    private dialog: DynamicDialogConfig,
  ) { }

  ngOnInit() {
    if (this.dialog.data) {
      this.id = this.dialog.data.id ?? null;
      this.data = this.dialog.data.data ?? null;
      this.data ? this.mode = 'edit' : this.mode = 'create';

      this.endpoint = this.endpoint + '/' + this.id + '/banners';
    }
    this.setupForm();
  }

  setupForm() {
    this.forms = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      position: ['', Validators.required],
      file: ['', Validators.required],
      imageName: [{ value: '', disabled: true }],
      externalUrl: [''],
    });

    this.data && this.forms.patchValue(this.data);
    if (this.mode == 'edit') {
      const temp = {
        preview: this.data.fileUrl,
        type: this.helper.getTypeMedia(this.data.fileUrl),
        name: this.data.fileUrl?.split('/').pop(),
      }
      this.mediatemp.push(temp);
      this.getFormControl('file')?.clearValidators();
      this.getFormControl('imageName')?.setValue(temp.name);
      this.iniPosition();
      this.forms.markAllAsTouched();
      this.forms.updateValueAndValidity();
    }
  }

  getFormControl(name: string) {
    return this.forms?.controls[name];
  }

  showErrorFormControl(name: string) {
    return this.helper.showErrorFormControl(this.getFormControl(name));
  }

  onSubmit() {
    if (this.isLoading == false) {
      if (this.forms.valid) {
        this.isLoading = true;

        let payload = Object.assign({}, this.forms.value);
        payload.eventId = this.id;
        delete payload.imageName;

        this.mode == 'edit' ? this.update(payload) : this.create(payload);
      } else {
        this.helper.showErrorAlert('Error', this.mode == 'edit' ? 'Failed to save changes.' : 'Failed to add Banner.');
      }
    }
  }

  create(payload:any) {
    this.api.post_formdata(payload,this.endpoint).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', res.message ?? 'Banner has been created.');
          this.endpoint = events_endpoint.events;
          this.ref.close('success');
        }
        this.isLoading = false;
      },
      err => {
        console.log(err);
        this.isLoading = false;
        this.isErrorMaxSplash = err.includes('Exceed Max Splash Banner: Only 2 Splash Banners are allowed.');
        this.helper.showErrorAlert('Error', err ?? err.message ?? 'Failed to create banner data.');
      }
    )
  }

  update(payload:any) {
    const upBanner_ep = this.endpoint + '/' + this.data.id;
    this.api.put_formdata(payload, upBanner_ep).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', 'Banner has been updated.');
          this.endpoint = events_endpoint.events;
          this.ref.close('success');
        }
        this.isLoading = false;
      },
      err => {
        console.log(err);
        this.isLoading = false;
        this.helper.showErrorAlert('Error', 'Failed to update banner data.');
      }
    )
  }

  onClose(): void {
    this.endpoint = events_endpoint.events;
    this.ref.close();
  }

  onChangePosition(event: any) {
    if (event?.value) {
      this.getFormControl('file')?.reset();
      this.getFormControl('imageName')?.reset();
      this.getFormControl('externalUrl')?.reset();
      this.fileuploadComponent.clearFile();

      switch (event.value) {
        case 'splash':
          this.mediaOpt.message = 'Maximum size 25 MB with resolution 1080x1920 px. Supports JPEG or PNG only.';
          this.mediaOpt.ratio = 9 / 16;
          this.mediaOpt.accept = '.jpg,.jpeg,.png';
          this.mediaOpt.type_file = 'image';
          this.isShowUrl = true;
          this.getFormControl('externalUrl')?.setValidators([this.helper.urlValidator]);
          break;
        case 'topline':
          this.mediaOpt.message = 'Maximum size 25 MB with resolution 1920x1080 px. Supports JPEG or PNG only.';
          this.mediaOpt.ratio = 16 / 9;
          this.mediaOpt.accept = '.jpg,.jpeg,.png';
          this.mediaOpt.type_file = 'image';
          this.isShowUrl = true;
          this.getFormControl('externalUrl')?.setValidators([this.helper.urlValidator]);
          break;
        case 'video':
          this.mediaOpt.message = 'Maximum size 200 MB. Supports MP4 only.';
          this.mediaOpt.accept = '.mp4';
          this.mediaOpt.type_file = 'video';
          this.isShowUrl = false;
          this.getFormControl('externalUrl')?.clearValidators();
          break;
        default:
          break;
      }
    }
  }

  iniPosition() {
    if (this.data && this.data.position) {
      switch (this.data.position) {
        case 'splash':
          this.mediaOpt.message = 'Maximum size 25 MB with resolution 1080x1920 px. Supports JPEG or PNG only.';
          this.mediaOpt.ratio = 9 / 16;
          this.mediaOpt.accept = '.jpg,.jpeg,.png';
          this.mediaOpt.type_file = 'image';
          this.isShowUrl = true;
          this.getFormControl('externalUrl')?.setValidators([this.helper.urlValidator]);
          break;
        case 'topline':
          this.mediaOpt.message = 'Maximum size 25 MB with resolution 1920x1080 px. Supports JPEG or PNG only.';
          this.mediaOpt.ratio = 16 / 9;
          this.mediaOpt.accept = '..jpg,jpeg,.png';
          this.mediaOpt.type_file = 'image';
          this.isShowUrl = true;
          this.getFormControl('externalUrl')?.setValidators([this.helper.urlValidator]);
          break;
        case 'video':
          this.mediaOpt.message = 'Maximum size 200 MB. Supports MP4 only.';
          this.mediaOpt.accept = '.mp4';
          this.mediaOpt.type_file = 'video';
          this.isShowUrl = false;
          this.getFormControl('externalUrl')?.clearValidators();
          break;
        default:
          break;
      }
    }
  }

  onAddFile(event: any) {
    this.media = event[0];
    if (this.media) {
      this.getFormControl('file')?.setValue(event[0].file);
      this.getFormControl('imageName')?.setValue(event[0].name);
    } else {
      this.getFormControl('file')?.reset();
      this.getFormControl('imageName')?.reset();
    }
  }

  titlePopup() {
    return this.mode == 'edit' ? 'Edit Banner' : 'Create New Banner';
  }

}
