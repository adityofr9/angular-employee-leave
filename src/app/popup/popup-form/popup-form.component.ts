import { Component, Inject } from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-popup-form',
  templateUrl: './popup-form.component.html',
  styleUrls: ['./popup-form.component.scss']
})
export class PopupFormComponent {
  dynamicForm: FormGroup;
  formFields: any[];

  constructor(
    private fb: FormBuilder,
    // private dialogRef: MatDialogRef<PopupFormComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Dapatkan fields dinamis dari data yang diterima
    // this.formFields = data.formFields || [];
    this.formFields = [];
    this.dynamicForm = this.createForm();
  }

  // Membuat form dinamis berdasarkan field yang diberikan
  createForm(): FormGroup {
    const group: any = {};
    this.formFields.forEach((field) => {
      group[field.name] = [field.value || '', field.required ? Validators.required : []];
    });

    return this.fb.group(group);
  }

  // Menangani pengiriman form
  onSubmit(): void {
    if (this.dynamicForm.valid) {
      // this.dialogRef.close(this.dynamicForm.value);
    } else {
      console.log('Form tidak valid');
    }
  }

  // Menutup dialog tanpa mengirimkan data
  onClose(): void {
    // this.dialogRef.close();
  }

}
