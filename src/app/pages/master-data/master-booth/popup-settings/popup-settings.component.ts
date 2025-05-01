import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { booths_endpoint, BoothService } from 'src/app/api/booth/booth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-popup-settings',
  templateUrl: './popup-settings.component.html',
  styleUrls: ['./popup-settings.component.scss']
})
export class PopupSettingsComponent implements OnInit {
  endpoint: any = booths_endpoint.booths;

  forms!: FormGroup;
  isLoading: boolean = false;

  checked: boolean = false;

  id: any;
  data: any;

  constructor(
    private api: BoothService,
    private helper: HelperService,
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    private dialog:DynamicDialogConfig,
  ) { }

  ngOnInit() {
    if (this.dialog?.data) {
      this.data = this.dialog.data.data ?? null;
      this.id = this.dialog.data.id ?? null;
    }
    this.setupForm();
  }

  setupForm() {
    this.forms = this.fb.group({
      questionsShown: [null, [Validators.required, Validators.maxLength(2), Validators.min(0)]],
      maximalAttempts: [1, [Validators.required, Validators.maxLength(2), Validators.min(1)]],
      minimalPoint: [0, [Validators.required, Validators.maxLength(2), Validators.min(0)]],
      randomizeQuizEnabled: [false],
    });

    if (this.data.questionsShown !== null && this.data.maximalAttempts !== null && this.data.minimalPoint !== null) {
      this.forms.patchValue(this.data);
    }
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

      const epQuizSettings = this.endpoint + '/' + this.id + '/quiz/quiz-setting';
      const payload = this.forms.value;
      payload.questionsShown = Number(payload.questionsShown);
      payload.maximalAttempts = Number(payload.maximalAttempts);
      // payload.minimalPoint = Number(payload.minimalPoint);
      payload.minimalPoint = 0;

      this.api.put_withParam(payload, epQuizSettings).then(
        res => {
          if(res){
            this.helper.showSuccessAlert('Success', res.message ?? 'Changes have been saved.');
            this.ref.close('success');
          }
          this.isLoading = false;
        },
        err => {
          console.error(err);
          this.isLoading = false;
          this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to save changes.');
        }
      )
    } else {
      this.helper.showErrorAlert('Error', 'Failed to save changes.');
    }
  }

}
