import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { HelperService } from 'src/app/services/helper.service';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import Quill from 'quill';
import * as moment from 'moment';

@Component({
  selector: 'app-popup-create',
  templateUrl: './popup-create.component.html',
  styleUrls: ['./popup-create.component.scss']
})
export class PopupCreateComponent implements OnInit {
  endpoint = events_endpoint.events;

  id: any;
  data: any;

  eventId: any;
  eventData: any;

  forms!: FormGroup;
  mode: string = 'create';
  isLoading: boolean = false;

  quillInstance!: Quill;

  image: any;

  eventStart: any | Date;
  eventEnd: any | Date;

  imagetemp: any = null;
  tempDoc: any[] = [];

  isConflict: any = {
    start: false,
    end: false,
  };

  lengthEditor: any = 0;

  isOutDate: boolean = false;

  constructor(
    private ref: DynamicDialogRef,
    private dialog:DynamicDialogConfig,
    private fb: FormBuilder,
    private helper: HelperService,
    private api: EventsService
  ) { }

  ngOnInit() {
    if (this.dialog.data) {
      this.eventId = this.dialog.data.eventId ?? null;
      this.eventData = this.dialog.data.eventData ?? null;
      this.data = Object.assign({}, this.dialog.data.data) ?? null;
      this.id = this.dialog.data.scheduleId ?? null;
      this.mode = this.data && Object.keys(this.data).length > 0 ? 'edit' : 'create';
    }
    this.getEventDate();
    this.setupForm();
  }

  setupForm() {
    this.forms = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      date: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      information: [null],
      imageName: [{ value: '', disabled: true }],
      image: [null],
      existingImage: [null],
      documentsName: [{ value: '', disabled: true }],
      documents: [null],
      existingDocuments: [null],
    }, { validators: this.timeRangeValidator });

    if (this.mode == 'edit') {
      if (this.data) {
        const dates = moment(this.data.date, 'YYYY-MM-DD').toDate();
        const startTime = moment(this.data.startTime, 'HH:mm:ss').toDate();
        const endTime = moment(this.data.endTime, 'HH:mm:ss').toDate();

        this.isOutDate = dates < this.eventStart || dates > this.eventEnd;

        setTimeout(() => {
          this.forms?.patchValue({
            title: this.data?.title,
            date: this.isOutDate ? null : dates,
            startTime: this.isOutDate ? null : startTime,
            endTime: this.isOutDate ? null : endTime,
            information: this.data?.information,
            imageName: this.data?.media?.name,
            existingImage: this.data?.media?.id,
            documentsName: this.data?.documents?.map((doc: any) => doc.name).join('; '),
            existingDocuments: this.data?.documents?.map((doc: any) => doc.id),
          });
        }, 500);
      }

      this.imagetemp = this.data?.media && this.data?.media?.url  ? [{
        preview: this.data?.media?.url,
        type: this.helper.getTypeMedia(this.data?.media?.name),
        name: this.data?.media?.name.split('/').pop(),
      }] : [];

      this.tempDoc = this.data?.documents.length > 0
        ?  this.data?.documents.map((doc: any) => {
            return {
              id: doc.id,
              name: doc.name,
              file: null,
              preview: doc.url,
              type: this.helper.getTypeMedia(doc.name),
            }
          })
        : [];

    }
  }

  getFormControl(name: string) {
    return this.forms?.controls[name];
  }

  showErrorFormControl(name: string) {
    return this.helper.showErrorFormControl(this.getFormControl(name));
  }

  // Add the timeRangeValidator method
  timeRangeValidator(formGroup: FormGroup) {
    const startTime = formGroup.get('startTime')?.value;
    const endTime = formGroup.get('endTime')?.value;

    return startTime && endTime && startTime < endTime ? null : { timeRangeInvalid: true };
  }

  getEventDate() {
    if (this.eventData) {
      this.eventStart = this.eventData.startedAt ? moment(this.eventData.startedAt, 'YYYY-MM-DD').toDate() : null;
      this.eventEnd = this.eventData.endedAt ? moment(this.eventData.endedAt, 'YYYY-MM-DD').toDate() : null;
    }
  }

  onAddFile(event: any, type: string) {
    if (type === 'image') {
      this.imagetemp = event[0];
      if (event && event.length > 0) {
        this.imagetemp = event[0];
        this.getFormControl('image')?.setValue(event[0]?.file);
        this.getFormControl('imageName')?.setValue(event[0]?.name);
        if (this.imagetemp && !this.imagetemp.file) {
          this.getFormControl('existingimage')?.setValue(this.imagetemp.id);
        }
      } else {
        this.imagetemp = [];
        this.getFormControl('image')?.reset();
        this.getFormControl('imageName')?.reset();
        this.getFormControl('existingImage')?.reset();
      }
    } else {
      if (event && event.length > 0) {
        this.tempDoc = event;
        const documentFile = event.filter((file: any) => file.file)?.map((file: any) => file.file);
        this.getFormControl('documents')?.setValue(documentFile);
        const documentName = event.map((file: any) => file.name).join('; ');
        this.getFormControl('documentsName')?.setValue(documentName);
        const existFile = event.filter((file: any) => !file.file)?.map((file: any) => file.id)
        this.getFormControl('existingDocuments')?.setValue(existFile);
      } else {
        this.tempDoc = [];
        this.getFormControl('documents')?.reset();
        this.getFormControl('documentsName')?.reset();
        this.getFormControl('existingDocuments')?.reset();
      }
    }
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

  onSubmit() {
    if (this.isLoading == false) {
      if (this.forms.valid && this.lengthEditor <= 255) {
        this.isLoading = true;
        if (this.mode == 'create') {
          const epSubmit = this.endpoint + '/' + this.eventId + '/schedule';
          const params = {
            title: this.forms?.value?.title,
            date: moment(this.forms?.value?.date).format('YYYY-MM-DD'),
            startTime: moment(this.forms?.value?.startTime).format('HH:mm:ss'),
            endTime: moment(this.forms?.value?.endTime).format('HH:mm:ss'),
            information: this.forms?.value?.information ?? '',
          };
          const payload = {
            image: this.forms?.value?.image,
            documents: this.forms?.value?.documents,
          }

          this.api.post_formdata(payload, epSubmit, params).then(
            (res) => {
              if (res) {
                this.isLoading = false;
                this.helper.showSuccessAlert('Success', res.message ?? 'Schedule has been added to event.');
                this.ref.close('success');
              } else {
                this.isLoading = false;
                this.helper.showErrorAlert('Error', 'Failed to update schedule.');
              }
            },
            (err) => {
              console.error(err);
              this.isLoading = false;

              this.isConflict.start = err.message?.toLowerCase().includes("start time") && err.message?.toLowerCase().includes("conflict");
              this.isConflict.end = err.message?.toLowerCase().includes("end time") && err.message?.toLowerCase().includes("conflict");

              this.helper.showErrorAlert(
                'Error',
                err?.message ?? err ?? 'Failed to add schedule to event.'
              );
            }
          );
        } else {
          const epUpdate = this.endpoint + '/' + this.eventId + '/schedule/' + this.id;
          const params = {
            title: this.forms?.value?.title,
            date: moment(this.forms?.value?.date).format('YYYY-MM-DD'),
            startTime: moment(this.forms?.value?.startTime).format('HH:mm:ss'),
            endTime: moment(this.forms?.value?.endTime).format('HH:mm:ss'),
            information: this.forms?.value?.information,
            existingImage: this.forms?.value?.existingImage,
            existingDocuments: this.forms?.value?.existingDocuments,
          };
          const payload = {
            image: this.forms?.value?.image,
            documents: this.forms?.value?.documents,
          }

          this.api.put_formdata(payload, epUpdate, params).then(
            (res) => {
              if (res) {
                this.isLoading = false;
                this.helper.showSuccessAlert('Success', res.message ?? 'Schedule has been updated.');
                this.ref.close('success');
              } else {
                this.isLoading = false;
                this.helper.showErrorAlert('Error', 'Failed to update schedule.');
              }
            },
            (err) => {
              console.error(err);
              this.isLoading = false;

              this.isConflict.start = err?.toLowerCase().includes("start time") && err?.toLowerCase().includes("conflict");
              this.isConflict.end = err?.toLowerCase().includes("end time") && err?.toLowerCase().includes("conflict");

              if (!this.isConflict.start && !this.isConflict.end) {
                this.helper.showErrorAlert(
                  'Error',
                  err?.message ?? err ?? 'Failed to update schedule.'
                );
              }
            }
          );
        }
      } else {
        this.helper.showErrorAlert('Error', this.mode == 'edit' ? 'Failed to save changes.' : 'Failed to add schedule data.');
      }
    }
  }

  onClose(): void {
    this.ref.close();
  }

  titlePopup() {
    return this.mode == 'edit' ? 'Edit Schedule' : 'Create New Schedule';
  }

  onBlur(event:any, type: string) {
    setTimeout(() => {
      if (type === 'start') {
        if (event.target.value == "") {
          this.getFormControl('startTime')?.setValue(null);
          this.getFormControl('startTime')?.markAsTouched();
          this.getFormControl('startTime')?.markAsDirty();
        } else {
          // const startTime = this.getFormControl('startTime')?.value;
          // const endTime = this.getFormControl('endTime')?.value;

          // if (startTime && endTime && startTime >= endTime) {
          //   this.getFormControl('endTime')?.setValue(null);
          //   this.getFormControl('endTime')?.markAsTouched();
          //   this.getFormControl('endTime')?.markAsDirty();
          // }
        }
      } else {
        if (event.target.value == "") {
          this.getFormControl('endTime')?.setValue(null);
          this.getFormControl('endTime')?.markAsTouched();
          this.getFormControl('endTime')?.markAsDirty();
        } else {
          // const startTime = this.getFormControl('startTime')?.value;
          // const endTime = this.getFormControl('endTime')?.value;

          // if (startTime && endTime && startTime >= endTime) {
          //   this.getFormControl('startTime')?.setValue(null);
          //   this.getFormControl('startTime')?.markAsTouched();
          //   this.getFormControl('startTime')?.markAsDirty();
          // }
        }
      }
    }, 300);
  }

  onShow(event: any, type: string) {
    const newValue = moment(event?.element?.textContent , 'HH:mm').toDate();
    this.getFormControl(type)?.setValue(newValue);
  }

  count() {
    this.lengthEditor = this.quillInstance.getText().trim().length;
  }

  resetErr() {
    this.isOutDate = false;
  }
}
