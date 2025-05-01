import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CalendarView } from 'angular-calendar';
import { Calendar } from 'primeng/calendar';
import { DialogService } from 'primeng/dynamicdialog';
import { firstValueFrom } from 'rxjs';
import { PopupCreateComponent } from '../popup-create/popup-create.component';

@Component({
  selector: 'header-schedule',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnChanges {
  @Input() eventId: any;
  @Input() eventData: any;

  @Input() view: CalendarView = CalendarView.Week;

  @Input() viewDate?: Date | any;

  @Input() locale: string = 'en';

  @Output() viewChange = new EventEmitter<CalendarView>();

  @Output() viewDateChange = new EventEmitter<Date>();

  @Output() formChange = new EventEmitter<any>();

  CalendarView = CalendarView;

  types = [
    { name: 'Day', value: CalendarView.Day },
    { name: 'Week', value: CalendarView.Week },
    { name: 'Month', value: CalendarView.Month },
  ];
  selectedType = this.types[1];

  selectedDate: Date | null = null;

  @ViewChild('calendar') calendar!: Calendar;

  constructor(private dialog: DialogService) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {

    if (
      (changes['eventId'] && changes['eventId'].currentValue) ||
      (changes['eventData'] && changes['eventData'].currentValue)
    ) {
      this.selectedType = this.types[1];
    }
  }

  onChangeType(event: any) {
    this.viewChange.emit(event?.value?.value);
  }

  showCalendar() {
    const inputElement = document.querySelector(
      '.p-calendar input'
    ) as HTMLElement;
    if (inputElement) {
      inputElement.click(); // Simulasikan klik pada input kalender
    } else {
      console.error('Input element not found');
    }
  }

  async addNew(data?: any) {
    const form = this.dialog.open(PopupCreateComponent, {
      width: '80%',
      styleClass: 'custom-dialog',
      data: {
        data: data,
        eventId: this.eventId,
        eventData: this.eventData,
      },
      autoZIndex: false,
    });

    await firstValueFrom(form.onClose).then((res) => {
      if (res === 'success') {
        this.formChange.emit();
      }
    });
    return;
  }
}
