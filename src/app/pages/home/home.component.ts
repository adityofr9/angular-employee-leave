import { Component, OnInit } from '@angular/core';
import { map, mergeMap, startWith, Subject, timer } from 'rxjs';
import { AuthService } from 'src/app/api/auth/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  defaultFilter:any;

  retrigger$: Subject<void> = new Subject<void>();
  refresh$ = this.retrigger$.pipe(
      mergeMap(() => timer(100).pipe(
          map(() => true),
          startWith(false)
      )),
      startWith(true)
  );

  user: any;

  constructor(
    private helper : HelperService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    let start = this.helper.defaualtFilterDate().startDate;
    let end = this.helper.defaualtFilterDate().endDate;
    this.defaultFilter = {startDate:start,endDate:end};

    this.auth.users$.subscribe(res=>{
      this.user = res
    })
  }
}
