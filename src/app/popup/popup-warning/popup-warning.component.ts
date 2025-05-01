import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-popup-warning',
  templateUrl: './popup-warning.component.html',
  styleUrls: ['./popup-warning.component.scss']
})
export class PopupWarningComponent implements OnInit {

  type:string = '';
  isBulkAction:boolean = false;

  constructor(
    // public dialogRef: MatDialogRef<PopupWarningComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    // console.log('data', this.data);
  }

  close() {
    // this.dialogRef.close();
  }

  submit() {
    // this.dialogRef.close({data:'Ok'});
  }

}
