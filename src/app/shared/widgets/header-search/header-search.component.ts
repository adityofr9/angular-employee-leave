import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-header-search',
  templateUrl: './header-search.component.html',
  styleUrls: ['./header-search.component.scss']
})
export class HeaderSearchComponent implements OnInit {
  @Input() items: any | undefined;
  @Input() labels: string | undefined;
  @Output() searchEvent = new EventEmitter();
  @Output() selectEvent = new EventEmitter();
  @Output() clearEvent = new EventEmitter();

  selectedItem: any;
  filteredItems: any[] = [];

  private debounceTimer: any;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['items'] && changes['items'].currentValue)
    ) {
      this.filteredItems = this.items;
    }
  }

  search(event: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.searchEvent.emit(event);
    }, 500);
  }

  onSelect(event: any) {
    setTimeout(() => {
      this.selectEvent.emit(event);
    }, 500);
  }

  onBlur() {
    setTimeout(() => {
      const isExist = this.items.find((item: any) => item.id === this.selectedItem?.id || item === this.selectedItem);
      if (!isExist) {
        this.selectedItem = null;
        this.clearEvent.emit();
      }
    }, 500);
  }

  onClear() {
    this.clearEvent.emit();
  }
}
