import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() title!: string | undefined;
  @Input() hasSearch!: boolean;
  @Input() labelSearch!: string | undefined;
  @Input() listItems!: any;
  @Input() hasFilter!: boolean;
  @Input() filterFields!: any[];
  @Input() hasActionBtn!: boolean;
  @Input() actionButtons!: any[];

  @Output() onSubmitFilter = new EventEmitter();
  @Output() onAction = new EventEmitter();
  @Output() onSearch = new EventEmitter();
  @Output() onSelect = new EventEmitter();
  @Output() onClearSearch = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['listItems'] && changes['listItems'].currentValue) ||
      (changes['labelSearch'] && changes['labelSearch'].currentValue)
    ) {
    }
  }

  filterData(data: any) {
    this.onSubmitFilter.emit(data);
  }

  runAction(data: any) {
    this.onAction.emit(data);
  }

  searchedData(data: any) {
    this.onSearch.emit(data?.query);
  }

  selectData(data: any) {
    this.onSelect.emit(data);
  }

  clearSearch() {
    this.onClearSearch.emit();
  }

}
