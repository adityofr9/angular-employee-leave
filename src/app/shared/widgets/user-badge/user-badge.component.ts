import { Component, Input, OnInit } from '@angular/core';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-user-badge',
  templateUrl: './user-badge.component.html',
  styleUrls: ['./user-badge.component.scss']
})
export class UserBadgeComponent implements OnInit {
  @Input() status:any;
  @Input() customClass!:any;

  constructor(
    private helper: HelperService
  ) { }

  ngOnInit() {
  }

  maskStatus(){
    return this.helper.maskStatus(this.status);
  }
}
