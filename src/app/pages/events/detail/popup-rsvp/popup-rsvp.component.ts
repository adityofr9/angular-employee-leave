import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { users_endpoint, UserService } from 'src/app/api/user/user.service';
import { HelperService } from 'src/app/services/helper.service';
import { events_endpoint } from 'src/app/api/events/events.service';

@Component({
  selector: 'app-popup-rsvp',
  templateUrl: './popup-rsvp.component.html',
  styleUrls: ['./popup-rsvp.component.scss']
})
export class PopupRsvpComponent implements OnInit {
  endpoint = events_endpoint.events;
  endpoints_user = users_endpoint.assign_user;

  forms!: FormGroup;
  isLoading: boolean = false;

  listAssign: any[] = [];

  id: any;
  data: any;
  mode: string = 'create';

  levelAccess: any[] = [
    { name: 'Bronze', value: 'bronze' },
    { name: 'Silver', value: 'silver' },
    { name: 'Gold', value: 'gold' },
    { name: 'Platinum', value: 'platinum' }
  ];

  selectedUser: any;

  constructor(
    private fb: FormBuilder,
    private api: UserService,
    private helper: HelperService,
    private ref: DynamicDialogRef,
    private dialog:DynamicDialogConfig
  ) { }

  ngOnInit() {
    if (this.dialog?.data?.data) {
      this.data = this.dialog.data?.rsvpData ?? null;
      this.id = this.dialog.data?.data.id ?? null;
      this.data && this.id ? this.mode = 'edit' : this.mode = 'create';
    }
    this.setupForm();
    if (this.mode == 'create') {
      this.getListAssignUsers();
    }
  }

  setupForm() {
    this.forms = this.fb.group({
      cin: [{value: null, disabled: this.mode == 'edit'}, Validators.required],
      accessLevel: [null],
      seatPosition: ['', Validators.maxLength(25)],
      zone: ['', Validators.maxLength(25)],
      points: [0, Validators.required],
    });

    if (this.data && this.mode == 'edit') {
      const currentData = {
        cin: this.data.userCin,
        accessLevel: this.data.accessLevel,
        seatPosition: this.data.seatPosition,
        zone: this.data.zone,
        points: this.data.points,
      };
      this.forms.patchValue(currentData);
      this.selectedUser = {
        name: this.data.userCin + ' - ' + this.data.userName,
        cin: this.data.userCin
      };
      this.selectedUser && this.listAssign.push(this.selectedUser);
    }
  }

  getFormControl(name: string) {
    return this.forms?.controls[name];
  }

  showErrorFormControl(name: string) {
    return this.helper.showErrorFormControl(this.getFormControl(name));
  }

  getListAssignUsers() {
    const queries =
    {
      eventId: this.id
    };
    const epAssignUser = this.endpoints_user;

    // const selectedUser = this.data?.users?.map((e: any) => {
    //   return {
    //     id: e.cin,
    //     name: e.name,
    //   }
    // });

    this.listAssign = [];
    this.api.getAll2(queries, epAssignUser).then(
      (res) => {
        if (res.success) {
          this.listAssign = [ ...this.listAssign, ...res.data];
        } else {
          this.listAssign = [];
        }
      },
      (err) => {
        console.log(err);
        this.listAssign = [];
        this.helper.showErrorAlert('Error', err.message ?? 'Failed to fetch users data.');
      }
    );
  }

  onClose(): void {
    this.selectedUser = {};
    this.ref.close();
  }

  onSubmit() {
    if (this.isLoading == false) {
      if (this.forms.valid) {
        this.isLoading = true;
        const payload = Object.assign({}, this.forms.value);
        payload.points = parseInt(payload.points);
        this.mode == 'edit' ? this.update(payload) : this.create(payload);
      } else {
        this.helper.showErrorAlert('Error', this.mode == 'edit' ? 'Failed to save changes.' : 'Failed to add RSVP.');
      }
    }
  }

  create(payload: any) {
    const epRSVP = this.endpoint + '/' + this.id + '/participants';
    this.api.post(payload, epRSVP).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', 'RSVP has been created.');
          this.ref.close('success');
        }
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
        this.helper.showErrorAlert('Error', 'Failed to create RSVP data.');
      }
    )
  }

  update(payload: any) {
    const epUpdateRSVP = this.endpoint + '/' + this.id + '/participants';
    this.api.put(this.data.id,payload,epUpdateRSVP).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', 'RSVP has been updated.');
          this.ref.close('success');
        }
        this.isLoading = false;
      },
      err => {
        console.error(err);
        this.isLoading = false;
        this.helper.showErrorAlert('Error', 'Failed to update RSVP data.');
      }
    )
  }

  rename(name: any) {
    return this.helper.renameAssignTo(name)
  }

}
