import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { menus_endpoint, MenuService } from 'src/app/api/menu/menu.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-popoup-edit',
  templateUrl: './popoup-edit.component.html',
  styleUrls: ['./popoup-edit.component.scss'],
})
export class PopoupEditComponent implements OnInit {
  endpoint = menus_endpoint.menus;

  forms!: FormGroup;
  isLoading: boolean = false;

  image: any;

  data: any;
  iconMedia: any[] = [];

  isExistError: boolean = false;

  constructor(
    private api: MenuService,
    private helper: HelperService,
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    private dialog: DynamicDialogConfig,
  ) {}

  ngOnInit() {
    if (this.dialog.data) {
      this.data = this.dialog.data ?? null;
    }
    this.setupForm();
  }

  setupForm() {
    this.forms = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      image: [''],
      imageName: [{ value: '', disabled: true }],
      status: [true, Validators.required],
      existingFile: [''],
    });

    this.data && this.forms.patchValue({
      name: this.data?.name,
      status: this.data?.status,
      existingFile: this.data?.fileUrl,
      imageName: (this.data?.fileName && this.data?.fileName != '-') && (this.data?.fileUrl && this.data?.fileUrl != '-') ? this.data?.fileName : '',
      image: null
    });

    this.iconMedia = [];
    if (this.data?.fileUrl && this.data?.fileUrl != '-') {
      const iconTemp = {
        preview: this.data?.fileUrl,
        type: this.helper.getTypeMedia(this.data?.fileUrl),
        name: this.data?.fileName,
      }
      this.iconMedia.push(iconTemp);
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
        const edit_enpoint = this.endpoint + '/' + this.data.id;
        const payload = Object.assign({}, this.forms.value);
        delete payload.imageName;
        delete payload.existingFile;
        delete payload.name;
        delete payload.status;

        const params = {
          name: this.forms.value.name,
          existingFile: this.forms.value.existingFile,
        }

        if (!params.existingFile || payload.image) {
          delete params.existingFile;
        }

        this.api.put_formdata(payload, edit_enpoint, params).then(
          (res) => {
            if (res) {
              this.helper.showSuccessAlert('Success', res.message);
              this.iconMedia = [];
              this.ref.close('success');
              this.isLoading = false;
            }
          },
          (err) => {
            console.log(err);
            this.isExistError = err.includes('(Menu name already exist)');
            this.helper.showErrorAlert('Failed', err.message ?? 'Failed to save changes.');
            this.isLoading = false;
          }
        );
      } else {
        this.helper.showErrorAlert('Error', 'Failed to save changes.');
      }
    }
  }

  onClose(): void {
    this.iconMedia = [];
    this.ref.close();
  }

  onTextChange(event: any) {
    // console.log(event);
    // console.log(this.getFormControl('information')?.value);
  }

  onAddFile(event: any) {
    this.image = event[0];
    if (this.image) {
      this.getFormControl('image')?.setValue(event[0].file);
      this.getFormControl('imageName')?.setValue(event[0].name);
      this.getFormControl('existingFile')?.setValue(null);
    } else {
      this.getFormControl('image')?.reset();
      this.getFormControl('imageName')?.reset();
      this.getFormControl('existingFile')?.reset();
    }
  }

}
