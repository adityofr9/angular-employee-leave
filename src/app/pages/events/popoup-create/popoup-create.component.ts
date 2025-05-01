import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { HelperService } from './../../../services/helper.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { users_endpoint, UserService } from 'src/app/api/user/user.service';
import * as moment from 'moment';

@Component({
  selector: 'app-popoup-create',
  templateUrl: './popoup-create.component.html',
  styleUrls: ['./popoup-create.component.scss'],
})
export class PopoupCreateComponent implements OnInit {
  endpoint = events_endpoint.events;
  endpoint_user = users_endpoint.assign;

  forms!: FormGroup;
  isLoading: boolean = false;

  listAssign: any[] = [];

  Query: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: '',
      sortBy: 'name',
      direction: 'asc'
    }
  );

  data: any;
  mode: string = 'create';
  role: string = '';

  today: Date = new Date();
  startedAt: Date | null = null;

  isError: boolean = false;
  msgError: string = '';

  listErrAsign: any[] = [];

  constructor(
    private api: EventsService,
    private apiUser: UserService,
    private helper: HelperService,
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    private dialog:DynamicDialogConfig
  ) { }

  ngOnInit() {
    if (this.dialog.data) {
      this.data = this.dialog.data.data ?? null;
      this.role = this.dialog.data.roles ?? '';
    }
    this.data ? this.mode = 'edit' : this.mode = 'create' ;
    this.getListAssign();
    this.setupForm();
    // this.apiUser.listAssign$.subscribe((res) => {
    //   if (res) {
    //     const selectedUser = this.data.users.map((e: any) => {
    //       return {
    //         id: e.cin,
    //         name: e.name,
    //       }
    //     });
    //     this.listAssign = [ ...selectedUser, ...res];
    //   } else {
    //     this.apiUser.GET_ListAssign();
    //   }

    // });
    // this.getData();
  }

  setupForm() {
    this.forms = this.fb.group(
      {
        name: ['', Validators.required],
        users: [{ value: null, disabled: this.role.toUpperCase() != 'SUPERADMIN' && this.mode == 'edit' }],
        startedAt: [null, Validators.required],
        endedAt: [null, Validators.required],
        // status: [true, Validators.required],
      }
    );

    if (this.data && this.mode == 'edit') {
      this.startedAt = new Date(this.data.startedAt) < this.today ? new Date(this.data.startedAt) : this.today;
      const startedAt = new Date(this.data.startedAt);
      const endedAt = new Date(this.data.endedAt);
      this.forms.patchValue({
        name: this.data.name,
        startedAt: startedAt,
        endedAt: endedAt,
        // status: this.data.status,
        users: this.data.users.map((e: any) => e.cin),
      });
    }
  }

  getFormControl(name: string) {
    return this.forms?.controls[name];
  }

  onSubmit() {
    if (this.isLoading == false) {
      if (this.forms.valid && !this.isError) {
        this.isLoading = true;
        const payload = this.forms.value;
        payload.startedAt = moment(payload.startedAt).format('YYYY-MM-DD');
        payload.endedAt = moment(payload.endedAt).format('YYYY-MM-DD');
        this.mode == 'edit' ? this.update(payload) : this.create(payload);
      } else {
        this.helper.showErrorAlert('Error', this.msgError && this.msgError !== '' ? this.msgError : this.mode == 'edit' ? 'Failed to save changes.' : 'Failed to add event data.');
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
          this.helper.showSuccessAlert('Success', 'Event has been created.');
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
        //   this.helper.showErrorAlert('Error', err.split('|')[1].trim());
        //   // this.getFormControl('startedAt')?.setErrors({ invalid: true });
        //   // this.getFormControl('endedAt')?.setErrors({ invalid: true });
        //   this.isError = true;

        if (err.data && err.data.length > 0) {
          this.listErrAsign = Object.assign([], err.data);
          this.msgError = err.message;
          this.helper.showErrorAlert('Error', err.message);
          this.isError = true;
        } else {
          this.helper.showErrorAlert('Error', 'Failed to create event data.');
        }
      }
    )
  }

  update(payload: any) {
    this.api.put(this.data.id, payload, this.endpoint).then(
      res => {
        if(res){
          // if (res.message.includes('|')) {
          //   this.helper.showWarningAlert('Warning', res.message.split('|')[1].trim());
          // } else {
          this.helper.showSuccessAlert('Success', 'Event has been updated.');
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
        //   this.helper.showErrorAlert('Error', err.split('|')[1].trim());
        //   // this.getFormControl('startedAt')?.setErrors({ invalid: true });
        //   // this.getFormControl('endedAt')?.setErrors({ invalid: true });
        //   this.isError = true;

        if (err.data && err.data.length > 0) {
          this.listErrAsign = Object.assign([], err.data);
          this.msgError = err.message;
          this.helper.showErrorAlert('Error', err.message);
          this.isError = true;
        } else {
          this.helper.showErrorAlert('Error', err.message ?? 'Failed to update event data.');
        }
      }
    )
  }

  onClose(): void {
    this.ref.close();
  }

  titlePopup() {
    return this.mode == 'edit' ? 'Edit Event' : 'Create New Event';
  }

  getData() {
    this.api.getAll(this.Query, this.endpoint_user).then(
      (res) => {
        if (res.success) {
          this.listAssign = res.data.result;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getListAssign() {
    const queries: QueryParams = Object.assign(
      {},
      QueryData,
      {
        limit: '',
        sortBy: 'name',
        direction: 'asc',
        startDate: this.data?.startedAt ?? '',
        endDate: this.data?.endedAt ?? '',
      });

    const selectedUser = this.data?.users?.map((e: any) => {
      return {
        id: e.cin,
        name: e.name,
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

  rename(name: any) {
    return this.helper.renameAssignTo(name)
  }

  resetErr() {
    this.listErrAsign = [];
    this.isError = false;
    this.msgError = '';
  }
}
