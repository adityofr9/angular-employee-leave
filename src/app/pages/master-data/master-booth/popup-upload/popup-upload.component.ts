import { map } from 'rxjs';
import { media } from './../../../../api/events/event.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { booths_endpoint, BoothService } from 'src/app/api/booth/booth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-popup-upload',
  templateUrl: './popup-upload.component.html',
  styleUrls: ['./popup-upload.component.scss'],
})
export class PopupUploadComponent implements OnInit {
  endpoint = booths_endpoint.booths;

  forms!: FormGroup;
  isLoading: boolean = false;

  id: any;
  data: any;

  tempLogo: any = null;
  tempMedia: any[] = [];
  tempDoc: any[] = [];

  constructor(
    private api: BoothService,
    private helper: HelperService,
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    private dialog: DynamicDialogConfig
  ) {}

  ngOnInit() {
    if (this.dialog.data) {
      this.id = this.dialog.data.id ?? null;
      this.data = this.dialog.data.data ?? null;
    }
    this.setupForm();
  }

  setupForm() {
    this.forms = this.fb.group({
      existingLogos: [null],
      existingMedia: [null],
      existingDocuments: [null],
      logos: [null],
      logosName: [{ value: '', disabled: true }],
      media: [null],
      mediaName: [{ value: '', disabled: true }],
      documents: [null],
      documentName: [{ value: '', disabled: true }],
    });

    const exsitingData = {
      existingLogos: this.data?.logos?.map((logo: any) => logo.id),
      existingMedia: this.data?.media?.map((media: any) => media.id),
      existingDocuments: this.data?.document?.map((doc: any) => doc.id),
      logosName: this.data?.logos?.map((logo: any) => logo.name)?.join('; '),
      mediaName: this.data?.media?.map((media: any) => media.name)?.join('; '),
      documentName: this.data?.document?.map((doc: any) => doc.name)?.join('; '),
      logos: null,
      media: null,
      documents: null,
    }

    this.tempDoc = this.data?.document?.map((doc: any) => {
      return {
        preview: doc?.url,
        type: this.helper.getTypeMedia(doc?.name ?? doc?.url),
        name: doc?.name ?? doc?.url?.split('/').pop(),
        id: doc?.id,
      }
    });

    this.tempLogo = this.data?.logos?.map((logo: any) => {
      return {
        preview: logo?.url,
        type: this.helper.getTypeMedia(logo?.name ?? logo?.url),
        name: logo?.name ?? logo?.url?.split('/').pop(),
        id: logo?.id,
      }
    });

    this.tempMedia = this.data?.media?.map((media: any) => {
      return {
        preview: media?.url,
        type: this.helper.getTypeMedia(media?.name ?? media?.url),
        name: media?.name ?? media?.url?.split('/').pop(),
        id: media?.id,
      }
    });

    this.data && this.forms.patchValue(exsitingData);
  }

  getFormControl(name: string) {
    return this.forms?.controls[name];
  }

  onClose(): void {
    this.ref.close();
  }

  onAddFile(event: any, type: string) {
    switch (type) {
      case 'logo':
        if (event && event.length > 0) {
          this.tempLogo = event[0];
          this.getFormControl('logos')?.setValue(event[0]?.file);
          this.getFormControl('logosName')?.setValue(event[0]?.name);
          if (this.tempLogo && !this.tempLogo.file) {
            this.getFormControl('existingLogos')?.setValue(this.tempLogo.id);
          }
        } else {
          this.tempLogo = [];
          this.getFormControl('logos')?.reset();
          this.getFormControl('logosName')?.reset();
          this.getFormControl('existingLogos')?.reset();
        }
        break;
      case 'media':
        if (event && event.length > 0) {
          this.tempMedia = event;
          const mediaFile = event.filter((file: any) => file.file)?.map((file: any) => file.file);
          this.getFormControl('media')?.setValue(mediaFile);
          const mediaName = event.map((file: any) => file.name).join('; ');
          this.getFormControl('mediaName')?.setValue(mediaName);
          const existFile = event.filter((file: any) => !file.file)?.map((file: any) => file.id);
          this.getFormControl('existingMedia')?.setValue(existFile);
        } else {
          this.tempMedia = [];
          this.getFormControl('media')?.reset();
          this.getFormControl('mediaName')?.reset();
          this.getFormControl('existingMedia')?.reset();
        }
        break;
      case 'document':
        if (event && event.length > 0) {
          this.tempDoc = event;
          const documentFile = event.filter((file: any) => file.file)?.map((file: any) => file.file);
          this.getFormControl('documents')?.setValue(documentFile);
          const documentName = event.map((file: any) => file.name).join('; ');
          this.getFormControl('documentName')?.setValue(documentName);
          const existFile = event.filter((file: any) => !file.file)?.map((file: any) => file.id)
          this.getFormControl('existingDocuments')?.setValue(existFile);
        } else {
          this.tempDoc = [];
          this.getFormControl('documents')?.reset();
          this.getFormControl('documentName')?.reset();
          this.getFormControl('existingDocuments')?.reset();
        }
        break;
      default:
        return;
    }
  }

  onSubmit() {
    if (this.isLoading == false) {
      this.isLoading = false;
      const params = {
        existingLogos: this.forms.value.existingLogos,
        existingMedia: this.forms.value.existingMedia,
        existingDocuments: this.forms.value.existingDocuments,
      }
      const payload = {
        logos: this.forms.value.logos,
        media: this.forms.value.media,
        documents: this.forms.value.documents,
      }

      const epUpload = this.endpoint + '/' + this.id + '/files';

      this.api.post_formdata(payload, epUpload, params).then(
        (res) => {
          if (res) {
            this.helper.showSuccessAlert('Success', res.message ?? 'Files have been added.');
            this.ref.close('success');
          } else {
            this.helper.showErrorAlert('Error', 'Failed to add files.');
          }
          this.isLoading = false;
        },
        (err) => {
          console.error(err);
          this.isLoading = false;
          this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to add files.');
        }
      );
    }
  }
}
