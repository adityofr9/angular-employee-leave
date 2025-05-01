import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import Quill from 'quill';
import {
  events_endpoint,
  EventsService,
} from 'src/app/api/events/events.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.scss'],
})
export class GeneralInfoComponent implements OnInit, OnChanges {
  @Input() parentId: any;
  @Input() general: any;
  @Input() media: any;
  @Input() main: any;
  @Output() generalChange = new EventEmitter();

  endpoint = events_endpoint.events;

  isEdit: boolean = false;

  forms!: FormGroup;

  quillInstance!: Quill;

  isLoading: boolean = false;

  logoTemp: any[] = [];
  bgTemp: any[] = [];

  lengthEditor: any = 0;

  constructor(
    private fb: FormBuilder,
    private helper: HelperService,
    private api: EventsService
  ) {}

  ngOnInit() {
    this.setupForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['parentId'] && changes['parentId'].currentValue) ||
      (changes['general'] && changes['general'].currentValue) ||
      (changes['media'] && changes['media'].currentValue) ||
      (changes['main'] && changes['main'].currentValue)
    ) {
      this.bindValue();
    }
  }

  setupForm() {
    this.forms = this.fb.group({
      description: ['', Validators.maxLength(255)],
      location: ['', Validators.maxLength(100)],
      information: [''],
      eventLogoFile: [''],
      logoName: [{ value: '', disabled: true }],
      existingEventLogoFile: [''],
      backgroundImageFile: [''],
      backgroundName: [{ value: '', disabled: true }],
      existingBackgroundImageFile: [''],
    });
  }

  bindValue() {
    this.forms?.patchValue({
      description: this.general?.description != '-' ? this.general?.description : '',
      location: this.general?.location != '-' ? this.general?.location : '',
      information: this.general?.information != '-' ? this.general?.information : '',
      logoName: this.media?.eventLogoName != '-' ? this.media?.eventLogoName : '',
      existingEventLogoFile: this.media?.eventLogo != '-' ? this.media?.eventLogo : '',
      existingBackgroundImageFile: this.media?.backgroundImage != '-' ? this.media?.backgroundImage : '',
      backgroundName: this.media?.backgroundImageName != '-' ? this.media?.backgroundImageName: '',
    });

    this.logoTemp = this.media?.eventLogo && this.media?.eventLogo !== '-'  ? [{
      preview: this.media.eventLogo,
      type: this.helper.getTypeMedia(this.media.eventLogo),
      name: this.media.eventLogoName,
    }] : [];

    this.bgTemp = this.media?.backgroundImage && this.media?.backgroundImage !== '-' ? [{
      preview: this.media?.backgroundImage,
      type: this.helper.getTypeMedia(this.media?.backgroundImage),
      name: this.media?.backgroundImageName,
    }] : [];
  }

  getFormControl(name: string) {
    return this.forms?.controls[name];
  }

  showErrorFormControl(name: string) {
    return this.helper.showErrorFormControl(this.getFormControl(name));
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

  onAddFile(event: any, type: string) {
    const image = event[0];
    if (image) {
      this.getFormControl(
        type == 'logo' ? 'eventLogoFile' : 'backgroundImageFile'
      )?.setValue(event[0].file);
      this.getFormControl(
        type == 'logo' ? 'logoName' : 'backgroundName'
      )?.setValue(event[0].name);
      this.getFormControl(
        type == 'logo' ? 'existingEventLogoFile' : 'existingBackgroundImageFile'
      )?.setValue(null);
    } else {
      this.getFormControl(
        type == 'logo' ? 'eventLogoFile' : 'backgroundImageFile'
      )?.reset();
      this.getFormControl(
        type == 'logo' ? 'logoName' : 'backgroundName'
      )?.reset();
      this.getFormControl(
        type == 'logo' ? 'existingEventLogoFile' : 'existingBackgroundImageFile'
      )?.reset();
    }
  }

  onSubmitted() {
    if (this.isLoading == false) {
      if (this.forms.valid && this.lengthEditor <= 999) {
        this.isLoading = true;
        const updateEp = this.endpoint + '/' + this.parentId + '/detail';
        const payload = {
          eventLogoFile: this.forms?.value?.eventLogoFile,
          backgroundImageFile: this.forms?.value?.backgroundImageFile,
        };
        const params = {
          description: this.forms?.value?.description,
          information: this.forms?.value?.information,
          location: this.forms?.value?.location,
          existingEventLogoFile: this.forms?.value?.existingEventLogoFile,
          existingBackgroundImageFile: this.forms?.value?.existingBackgroundImageFile,
        }

        if (!params.existingEventLogoFile || payload.eventLogoFile) {
          delete params.existingEventLogoFile;
        }

        if (!params.existingBackgroundImageFile || payload.backgroundImageFile) {
          delete params.existingBackgroundImageFile;
        }

        this.api.put_formdata(payload, updateEp, params).then(
          (res) => {
            if (res) {
              this.helper.showSuccessAlert(
                'Success',
                'General info has been updated.'
              );
            }
            this.isLoading = false;
            this.isEdit = false;
            this.generalChange.emit();
          },
          (err) => {
            console.log(err);
            this.isLoading = false;
            this.helper.showErrorAlert(
              'Error',
              err?.message ?? err ?? 'Failed to update general info data.'
            );
          }
        );
      } else {
        this.helper.showErrorAlert('Error', 'Failed to save changes.');
      }
    }
  }

  onCancel() {
    this.isEdit = false;
    this.isLoading = false;
    this.logoTemp = [];
    this.bgTemp = [];
    this.forms.reset();
    this.bindValue();
  }

  count() {
    this.lengthEditor = this.quillInstance.getText().trim().length;
  }
}
