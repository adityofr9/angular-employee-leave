import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'alert-error-input',
  templateUrl: './alert-error-input.component.html',
  styleUrls: ['./alert-error-input.component.scss']
})
export class AlertErrorInputComponent implements OnInit {
  @Input() control!: FormControl | any;
  @Input() label!: string;
  @Input() secondLabel!: string;
  constructor() { }

  ngOnInit() {
  }


  hasError(error: string): boolean {
    return this.control?.hasError(error) && (this.control?.touched || this.control?.dirty);
  }

}
