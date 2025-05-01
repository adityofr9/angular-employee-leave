import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { HelperService } from 'src/app/services/helper.service';
import * as moment from 'moment';

@Component({
  selector: 'app-popup-form',
  templateUrl: './popup-form.component.html',
  styleUrls: ['./popup-form.component.scss']
})
export class PopupFormComponent implements OnInit {
  endpoint: any = events_endpoint.events;

  forms!: FormGroup;
  mode: string = 'create';
  isLoading: boolean = false;

  id:any;
  data: any;

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

      this.endpoint = this.endpoint + '/' + this.id + '/form';
    }
    this.setupForm();
  }

  setupForm() {
    this.forms = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', Validators.maxLength(999)],
      dueDate: [null, Validators.required],
    });

    this.data && this.forms.patchValue(this.data);
    this.data && this.forms.controls['dueDate'].setValue(new Date(this.data.dueDate));
  }

  getFormControl(name: string) {
    return this.forms?.controls[name];
  }

  showErrorFormControl(name: string) {
    return this.helper.showErrorFormControl(this.getFormControl(name));
  }

  onClose(): void {
    this.ref.close();
  }

  onSubmit() {
    if (this.forms.valid) {
      this.isLoading = true;
      let payload = Object.assign({}, this.forms.value);
      // payload.eventId = this.id;
      payload.dueDate = moment(payload.dueDate).format('YYYY-MM-DD');
      this.mode == 'edit' ? this.update(payload) : this.create(payload);
    } else {
      this.helper.showErrorAlert('Error', this.mode == 'edit' ? 'Failed to save changes.' : 'Failed to add form data.');
    }
  }

  create(payload:any) {
    this.api.post(payload,this.endpoint).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', res.message ?? 'Form has been created.');
          this.endpoint = events_endpoint.events;
          this.ref.close('success');
        }
        this.isLoading = false;
      },
      err => {
        console.log(err);
        this.isLoading = false;
        this.helper.showErrorAlert('Error', err ?? err.message ?? 'Failed to create form data.');
      }
    )
  }

  update(payload:any) {
    this.api.put(this.data.id, payload, this.endpoint).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', 'Form has been updated.');
          this.endpoint = events_endpoint.events;
          this.ref.close('success');
        }
        this.isLoading = false;
      },
      err => {
        console.error(err);
        this.isLoading = false;
        this.helper.showErrorAlert('Error', 'Failed to update form data.');
      }
    )
  }

  titlePopup() {
    return this.mode == 'edit' ? 'Edit Form' : 'Create New Form';
  }

}
