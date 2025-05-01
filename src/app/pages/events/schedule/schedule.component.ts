import { ChangeDetectionStrategy, Component, input, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CalendarEvent,
  CalendarMonthViewBeforeRenderEvent,
  CalendarWeekViewBeforeRenderEvent,
  CalendarDayViewBeforeRenderEvent,
  CalendarMonthViewDay,
  CalendarView
} from 'angular-calendar';
import { addDays, addMonths, subMonths } from 'date-fns';
import moment from 'moment';
import { firstValueFrom, Subject } from 'rxjs';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'schedule',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  @Input() idParent: any;
  @Input() eventData: any;
  @Input() minDate: any | Date;
  @Input() maxDate: any | Date;

  endpoint: any = events_endpoint.events;

  eventId: any;

  view: CalendarView = CalendarView.Week;

  viewDate: Date = new Date();

  events: CalendarEvent[] = [];

  querySchedule: any = {
    mode: 'week',
    startDate: moment().startOf('week').format('YYYY-MM-DD'),
  };

  colorClasses: string[] = [
    'violet-blue',    // Warna 1
    'forest-green',   // Warna 2
    'orange-gamboge', // Warna 3
    'blue-bca',       // Warna 4
    'ember-red'       // Warna 5
  ];

  // minDate: any | Date;

  // maxDate: any | Date;

  refresh = new Subject<void>();

  locale: string = 'en';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: EventsService,
    private helper: HelperService
  ) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['eventData'] && changes['eventData'].currentValue) ||
      (changes['minDate'] && changes['minDate'].currentValue) ||
      (changes['maxDate'] && changes['maxDate'].currentValue)
    ) {
      this.minDate = new Date(this.eventData.startedAt);
      this.minDate.setHours(0, 0, 0, 0);
      this.maxDate = new Date(this.eventData.endedAt);
      this.maxDate.setHours(23, 59, 59, 999);

      firstValueFrom(this.route.paramMap).then((params: any) => {
        this.eventId = params.get('id');
        if (this.eventId) {
          const start = moment(this.viewDate).startOf(this.view).toDate();
          const end = moment(this.viewDate).endOf(this.view).toDate();
          this.querySchedule.mode = this.view;
          this.querySchedule.startDate = moment(start).format('YYYY-MM-DD');
          this.querySchedule.endDate = moment(end).format('YYYY-MM-DD');
          this.getSchedule();
        }

      });
      this.events = [];
      this.view = CalendarView.Week;
      this.viewDate = this.minDate ?? new Date();
      this.refreshView();
    }
  }

  lastClickTime: number = 0;
  clickTimeout: any;
  handleEvent(event: any, idSchedule: any): void {
    const currentTime = new Date().getTime();
    const clickInterval = 300; // Interval in milliseconds

    if (currentTime - this.lastClickTime < clickInterval) {
      clearTimeout(this.clickTimeout);
      this.onDoubleClick(event, idSchedule);
    } else {
      this.clickTimeout = setTimeout(() => {
        this.onSingleClick(event);
      }, clickInterval);
    }

    this.lastClickTime = currentTime;
  }

  onSingleClick(event: any): void {
    // console.log('Single click', event);
  }

  onDoubleClick(event: any, idSchedule:any): void {
    // console.log('Double click', event);
    this.router.navigateByUrl(`u/master-event/${this.eventId}/schedule/${idSchedule}`); // test dev
  }

  getSchedule() {
    const epSchedule = `${this.endpoint}/${this.eventId}/schedule`;
    this.api.getAll2(this.querySchedule, epSchedule).then(
      (res) => {
        // this.list = res.data;
        this.events = res.data.map((item: any, index: number) => {
          return {
            id: item.id,
            title: item.title,
            cssClass: this.getClassByIndex(index),
            start: new Date(item.date + ' ' + item.startTime),
            end: new Date(item.date + ' ' + item.endTime),
            resizable: {
              beforeStart: false,
              afterEnd: false,
            },
          };
        });

        this.refresh.next();
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to fetch booth data.');
      }
    );
  }

  getClassByIndex(index: number): string {
    const colorIndex = index % this.colorClasses.length;
    return this.colorClasses[colorIndex];
  }

  dateIsValid(date: Date): boolean {
    return date >= this.minDate && date <= this.maxDate;
  }

  // beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
  //   body.forEach((day) => {
  //     if (!this.dateIsValid(day.date)) {
  //       day.cssClass = 'cal-disabled';
  //     }
  //   });
  // }

  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach((day) => {
      const dayOfMonth = day.date.toDateString();

      if (dayOfMonth == new Date().toDateString()) {
        day.cssClass = 'cal-today';
      }

      if (!this.dateIsValid(day.date)) {
        day.cssClass += ' cal-disabled';
      }
    });
  }

  beforeWeekViewRender(renderEvent: CalendarWeekViewBeforeRenderEvent) {
    renderEvent.hourColumns.forEach((hourColumn) => {
      hourColumn.hours.forEach((hour) => {
        hour.segments.forEach((segment) => {
          const dayOfWeek = segment.date.toDateString();
          if (dayOfWeek == new Date().toDateString()) {
            segment.cssClass = 'cal-today';
          }

          if (!this.dateIsValid(segment.date)) {
            segment.cssClass += ' cal-disabled';
          }
        });
      });
    });
  }

  beforeDayViewRender(renderEvent: CalendarDayViewBeforeRenderEvent) {
    renderEvent.hourColumns.forEach((hourColumn) => {
      hourColumn.hours.forEach((hour) => {
        hour.segments.forEach((segment) => {
          const dayOfDay = segment.date.toDateString();
          if (dayOfDay == new Date().toDateString()) {
            segment.cssClass = 'cal-today';
          }

          if (!this.dateIsValid(segment.date)) {
            segment.cssClass += ' cal-disabled';
          }
        });
      });
    });
  }

  refreshView(): void {
    this.refresh.next();
  }

  updatedViewDate(): void {
    this.viewDate = new Date();
    this.getSchedule();
  }

  viewChange(event: any): void {
    const start = moment(this.viewDate).startOf(this.view).toDate();
    const end = moment(this.viewDate).endOf(this.view).toDate();

    this.querySchedule.mode = this.view;
    this.querySchedule.startDate = moment(start).format('YYYY-MM-DD');
    this.querySchedule.endDate = moment(end).format('YYYY-MM-DD');
    this.getSchedule();
    this.refreshView();
  }

}
