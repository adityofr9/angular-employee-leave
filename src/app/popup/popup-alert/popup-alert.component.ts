import { Component, OnInit } from '@angular/core';
// import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-popup-alert',
  templateUrl: './popup-alert.component.html',
  styleUrls: ['./popup-alert.component.scss']
})
export class PopupAlertComponent implements OnInit {

  type:string = '';
  isBulkAction:boolean = false;

  constructor(
    // private ref: DynamicDialogRef,
    // private dialog:DynamicDialogConfig
  ) { }

  ngOnInit() {
    // if (this.dialog.data) {
    //   this.type = this.dialog.data.stat ?? '';
    //   this.isBulkAction = this.dialog.data.isBulkAction ?? false;
    // }
  }

  close(){
    // this.ref.close();
  }

  submit(){
    // this.ref.close({data:'Ok'});
  }

}
