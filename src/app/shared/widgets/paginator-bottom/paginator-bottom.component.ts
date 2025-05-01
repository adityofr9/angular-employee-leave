import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Paginator, Paginator_m } from 'src/app/services/helper.service';

@Component({
  selector: 'app-paginator-bottom',
  templateUrl: './paginator-bottom.component.html',
  styleUrls: ['./paginator-bottom.component.scss'],
})
export class PaginatorBottomComponent implements OnInit {
  @Input() data!: Paginator_m;
  @Input() customOpt!: any[];
  @Output() onValueChange = new EventEmitter();
  @Input() urlBack: any = false;
  @Input() isNoOption: any = false;

  first = 0;
  options = [10, 20, 50, 100];
  constructor() {}

  ngOnInit() {
    if (this.data) {
      this.first = (this.data.page - 1) * this.data.limit;
    } else {
      this.data = Object.assign({}, Paginator);
    }

    if (this.customOpt) {
      this.options = this.customOpt;
    }
  }

  onPageChange(event: any) {
    this.data.limit = event.rows;
    this.data.page = event.page;
    this.onValueChange.emit(this.data);
  }
}
