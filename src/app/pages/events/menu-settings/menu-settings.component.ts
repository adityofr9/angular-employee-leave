import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-menu-settings',
  templateUrl: './menu-settings.component.html',
  styleUrls: ['./menu-settings.component.scss']
})
export class MenuSettingsComponent implements OnInit {
  endpoint = events_endpoint.events;

  id:any;
  eventData: any;
  data: any;

  isEditOther: boolean = false;

  otherforms!: FormGroup;
  isOtherLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api: EventsService,
    private helper: HelperService
  ) { }

  ngOnInit() {
    this.setupForm();
    firstValueFrom(this.route.paramMap).then((params: any) => {
      this.id = params.get('id');

      if (this.id) {
        this.getById();
      } else {
        this.router.navigate(['u/master-event']);
      }
    });
  }

  setupForm() {
    this.otherforms = this.fb.group(
      {
        displayPoint: [{ value: false, disabled: true }, Validators.required],
        scanQrFeature: [{ value: false, disabled: true }, Validators.required],
      }
    );
  }

  getFormControl(name: string) {
    return this.otherforms?.controls[name];
  }

  getById(){
    const epSettings = this.endpoint + '/' + this.id + '/event-settings';
    this.api.getAll2({},epSettings).then(
      res => {
        if (res.success) {
          this.data = res.data;
          this.eventData = res.attributes[0];
          this.helper.setBreadcumb([{id:this.eventData?.eventId[0], name:this.eventData?.eventName[0]}]);
          this.otherforms.patchValue(this.data?.otherSettings);
        }
      },
      err => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? 'Error while fetching data');
      }
    )
  }

  onSubmit() {
    if (this.otherforms.valid) {
      this.isOtherLoading = false;
      const payload = this.otherforms.value;

      const epOtherSet = this.endpoint + '/' + this.id + '/other-settings';
      this.api.put_withParam(payload, epOtherSet).then(
        res => {
          if(res){
            this.helper.showSuccessAlert('Success', 'Other Settings has been updated.');
          }
          this.isOtherLoading = false;
          this.isEditOther = false;
          this.data.otherSettings = this.otherforms.value;

          Object.keys(this.otherforms.controls).forEach(control => {
            this.otherforms.controls[control].disable();
          });
        },
        err => {
          console.error(err);
          this.isOtherLoading = false;
          this.helper.showErrorAlert('Error', err.message ?? 'Failed to update Other Settings data.');
        }
      )
    }
  }

  onEdit() {
    this.isEditOther = !this.isEditOther;
    this.otherforms.patchValue(this.data?.otherSettings);
    Object.keys(this.otherforms.controls).forEach(control => {
      this.otherforms.controls[control].enable();
    });
  }

  onView() {
    this.isEditOther = false;
    this.otherforms.patchValue(this.data?.otherSettings);
    Object.keys(this.otherforms.controls).forEach(control => {
      this.otherforms.controls[control].disable();
    });
  }

}
