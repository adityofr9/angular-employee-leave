import { firstValueFrom, map } from 'rxjs';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService } from 'src/app/services/helper.service';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'activity-settings',
  templateUrl: './activity-settings.component.html',
  styleUrls: ['./activity-settings.component.scss']
})
export class ActivitySettingsComponent implements OnInit, OnChanges {
  @Input() datas: any;
  endpoint = events_endpoint.events;

  id:any;
  data: any;

  isEdit: boolean = false;

  forms!: FormGroup;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api: EventsService,
    private helper: HelperService
  ) { }

  ngOnInit() {
    firstValueFrom(this.route.paramMap).then((params: any) => {
      this.id = params.get('id');

      if (this.id) {
      } else {
        this.router.navigate(['u/master-event']);
      }
    });
    this.setupForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['datas'] && changes['datas'].currentValue)
    ) {
      this.bindValue();
    }
  }

  setupForm() {
    this.forms = this.fb.group(
      {
        presentActivity: [0, [Validators.max(99), Validators.min(0)]],
        writeReviewActivity: [0, [Validators.max(99), Validators.min(0)]],
        quizActivity: [0, [Validators.max(99), Validators.min(0)]],
        attendingBoothActivity: [0, [Validators.max(99), Validators.min(0)]],
        askingActivity: [0, [Validators.max(99), Validators.min(0)]],
      }
    );
  }

  getFormControl(name: string) {
    return this.forms?.controls[name];
  }

  showErrorFormControl(name: string) {
    return this.helper.showErrorFormControl(this.getFormControl(name));
  }

  bindValue() {
    this.forms.patchValue(this.datas);
  }

  onSubmit() {
    if (this.isLoading == false) {
      if (this.forms.valid) {
        this.isLoading = true;
        const payload = Object.fromEntries(
          Object.entries(this.forms.value).map(([key, value]) => [key, Number(value)])
        );

        const epEctivitySet = this.endpoint + '/' + this.id + '/activity-settings';
        this.api.put_withParam(payload, epEctivitySet).then(
          res => {
            if(res){
              this.helper.showSuccessAlert('Success', 'Activity Settings has been updated.');
            }
            this.isLoading = false;
            this.isEdit = false;
          },
          err => {
            console.error(err);
            this.isLoading = false;
            this.helper.showErrorAlert('Error', err.message ?? 'Failed to update Activity Settings data.');
          }
        )
      } else {
        this.helper.showErrorAlert('Error', 'Failed to save changes.');
      }
    }

  }

  checkNumber(event: any) {
    if (!!event.target.value) {
      if (event.target.value < 0) {
        event.target.value = 0;
      } else if (event.target.value > 99) {
        event.target.value = 99;
      }
    } else {
      event.target.value = 0;
    }
  }

  cancel() {
    this.forms.reset();
  }
}
