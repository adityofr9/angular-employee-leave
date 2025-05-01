import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { booths_endpoint, BoothService } from 'src/app/api/booth/booth.service';
import { users_endpoint, UserService } from 'src/app/api/user/user.service';
import { HelperService } from 'src/app/services/helper.service';

import Quill from 'quill';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import * as moment from 'moment';

@Component({
  selector: 'app-popoup-create',
  templateUrl: './popoup-create.component.html',
  styleUrls: ['./popoup-create.component.scss'],
})
export class PopoupCreateComponent implements OnInit {
  endpoint = booths_endpoint.booths;

  forms!: FormGroup;
  isLoading: boolean = false;

  listAssign: any[] = [];
  quillInstance!: Quill;

  id: any;
  data: any;
  mode: string = 'create';
  role: string = '';

  today: Date | null = null;
  startedAt: Date | null = null;
  endedAt: Date | null = null;

  lengthEditor: any = 0;

  isOutDatedStart: boolean = false;
  isOutDatedEnd: boolean = false;
  isErrorAssign: boolean = false;
  listErrAsign: any[] = [];

  msgError: string = '';

  constructor(
    private api: BoothService,
    private apiUser: UserService,
    public helper: HelperService,
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    private dialog:DynamicDialogConfig
  ) { }

  ngOnInit() {
    if (this.dialog?.data?.data) {
      this.data = this.dialog.data.data ?? null;
      this.id = this.dialog.data.id ?? null;
      this.role = this.dialog.data.roles ?? '';
    }
    this.data && this.id ? (this.mode = 'edit', this.today = null) : (this.mode = 'create' , this.today = new Date());
    this.getListAssign();
    this.setupForm();
    // this.apiUser.listAssign$.subscribe((res) => {
    //   if (res) {
    //     this.listAssign = res;
    //   } else {
    //     this.apiUser.GET_ListAssign();
    //   }
    // });
  }

  setupForm() {
    this.forms = this.fb.group(
      {
        name: ['', [Validators.required, Validators.maxLength(100)]],
        users: [{ value: null, disabled: this.role.toUpperCase() == 'ADMIN_BOOTH' && this.mode == 'edit' }],
        startedAt: [null, Validators.required],
        endedAt: [null, Validators.required],
        status: [true, Validators.required],
        description: [''],
      }
    );

    if (this.data && this.mode == 'edit') {
      this.startedAt = this.data?.eventStartDate ? moment(this.data?.eventStartDate, 'YYYY-MM-DD').toDate() : null;
      this.endedAt = this.data?.eventEndDate ? moment(this.data?.eventEndDate, 'YYYY-MM-DD').toDate() : null;
      const endedAt = moment(this.data.endedAt, 'YYYY-MM-DD').toDate();
      const startedAt = moment(this.data.startedAt, 'YYYY-MM-DD').toDate();

      // Validate
      this.isOutDatedStart = this.startedAt ? startedAt < this.startedAt : false;
      this.isOutDatedEnd = this.endedAt ? endedAt > this.endedAt : false;

      this.forms.patchValue({
        name: this.data.name,
        startedAt: this.startedAt ? (startedAt >= this.startedAt ? startedAt : null) : startedAt,
        endedAt: this.endedAt ? (endedAt <= this.endedAt ? endedAt : null) : endedAt,
        status: this.data.status,
        description: this.data.description,
        users: this.data.admins.map((item: any) => item.secureId),
      });
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
      if (this.forms.valid && this.lengthEditor <= 255 && !this.isErrorAssign) {
        this.isLoading = true;
        const payload = this.forms.value;
        payload.startedAt = moment(payload.startedAt).format('YYYY-MM-DD');
        payload.endedAt = moment(payload.endedAt).format('YYYY-MM-DD');
        this.mode == 'edit' ? this.update(payload) : this.create(payload);
      } else {
        this.helper.showErrorAlert('Error', this.msgError && this.msgError !== '' ? this.msgError : this.mode == 'edit' ? 'Failed to save changes.' : 'Failed to create booth data.');
      }
    }
  }

  create(payload: any) {
    this.api.post(payload,this.endpoint).then(
      res => {
        if(res){
          // if (res.message.includes('|')) {
          //   this.helper.showWarningAlert('Warning', res.message.split('|')[1].trim());
          // } else {
          this.helper.showSuccessAlert('Success', 'Booth has been created.');
          // }
          this.ref.close('success');
        }
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
        // if (err.includes('|')) {
        //   this.msgError = err.split('|')[1].trim();
        //   this.helper.showErrorAlert('Warning', err.split('|')[1].trim());
        //   this.isErrorAssign = true;

        if (err.data && err.data.length > 0) {
          this.listErrAsign = Object.assign([], err.data);
          this.msgError = err.message;
          this.helper.showErrorAlert('Error', err.message);
          this.isErrorAssign = true;
        } else {
          // this.getFormControl('startedAt')?.setErrors({ invalid: true });
          // this.getFormControl('endedAt')?.setErrors({ invalid: true });
          this.helper.showErrorAlert('Error', err.message ?? 'Failed to create booth data.');
        }
      }
    )
  }

  update(payload: any) {
    this.api.put(this.id,payload,this.endpoint).then(
      res => {
        if(res){
          // if (res.message.includes('|')) {
          //   this.helper.showWarningAlert('Warning', res.message.split('|')[1].trim());
          // } else {
          this.helper.showSuccessAlert('Success', 'Booth has been updated.');
          // }
          this.ref.close('success');
        }
        this.isLoading = false;
      },
      err => {
        console.log(err);
        this.isLoading = false;
        // if (err.includes('|')) {
        //   this.msgError = err.split('|')[1].trim();
        //   this.helper.showErrorAlert('Warning', err.split('|')[1].trim());
        //   // this.getFormControl('startedAt')?.setErrors({ invalid: true });
        //   // this.getFormControl('endedAt')?.setErrors({ invalid: true });
        //   this.isErrorAssign = true

        if (err.data && err.data.length > 0) {
          this.listErrAsign = Object.assign([], err.data);
          this.msgError = err.message;
          this.helper.showErrorAlert('Error', err.message);
          this.isErrorAssign = true;
        } else {
          this.helper.showErrorAlert('Error', err.message ?? 'Failed to update booth data.');
        }
      }
    )
  }

  onClose(): void {
    this.ref.close();
  }

  titlePopup() {
    return this.mode == 'edit' ? 'Edit Booth' : 'Create New Booth';
  }

  onTextChange(event: any) {
    this.lengthEditor = this.quillInstance.getText().trim().length;
  }

  onEditorInit(event: any) {
    // Mendapatkan instans Quill dari PrimeNG Editor
    this.quillInstance = event.editor;

    // Gunakan event 'selection-change' untuk mendeteksi fokus dan blur
    this.quillInstance.on('selection-change', (range: any) => {
      const editorElement = document.querySelector('p-editor');
      if (range !== null) {
        // Editor mendapatkan fokus
        // console.log('Editor mendapatkan fokus');
        if (editorElement) {
          editorElement.classList.add('focused');
        }
      } else {
        // Editor kehilangan fokus
        // console.log('Editor kehilangan fokus');
        if (editorElement) {
          editorElement.classList.remove('focused');
        }
      }
    });
  }

  rename(name: any) {
    return this.helper.renameAssignTo(name)
  }


  getListAssign() {
    const queries: QueryParams = Object.assign(
      {},
      QueryData,
      {
        limit: '',
        sortBy: 'name',
        direction: 'asc',
        startDate: this.data?.eventStartDate ?? '',
        endDate: this.data?.eventEndDate ?? '',
      });

    const selectedUser = this.data?.admins?.map((e: any) => {
      return {
        id: e.secureId,
        name: e.cin + ' - ' + e.name,
      }
    });

    this.listAssign = [];
    this.api.getAll2(queries, users_endpoint.assign).then(
      (res) => {
        if (res.success) {
            const resDataIds = res.data.map((item: any) => item.id);
            this.listAssign = [
            ...res.data,
            ...selectedUser?.filter((item: any) => !resDataIds.includes(item.id)) ?? []
            ];
        } else {
          this.listAssign = selectedUser ?? [];
        }
      },
      (err) => {
        console.log(err);
        this.listAssign = selectedUser ?? [];
        this.helper.showErrorAlert('Error', err.message ?? 'Failed to fetch admin data.');
      }
    );
  }

  resetErr() {
    this.listErrAsign = [];
    this.isOutDatedStart = false;
    this.isOutDatedEnd = false;
    this.isErrorAssign = false;
    this.msgError = '';
  }

  onSelectDate(event: any, type: string) {
    console.log('event', event);
  }
}
