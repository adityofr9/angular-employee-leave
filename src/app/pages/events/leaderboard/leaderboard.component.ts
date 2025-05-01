import { Component, OnInit } from '@angular/core';
import { HelperService, Paginator, Paginator_m } from 'src/app/services/helper.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { booths_endpoint, BoothService } from 'src/app/api/booth/booth.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { DialogService } from 'primeng/dynamicdialog';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  endpoint = events_endpoint.events;

  id: any;
  eventData: any;
  list: any[] = [];

  Query: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: 20,
      sortBy: '',
      direction: ''
    });
  paginator = Object.assign(
    {},
    Paginator,
    {
      limit: 15
    });
  totalItems: any = 0;

  constructor(
    readonly title: Title,
    private router: Router,
    private route: ActivatedRoute,
    private api: EventsService,
    private helper: HelperService,
    private dialog: DialogService,
    private storage: StorageMap
  ) { }

  ngOnInit() {
    lastValueFrom(this.storage.get('eventData')).then((res:any)=>{
      if (res) {
        this.eventData = res;
        this.helper.setBreadcumb([
          {id:this.eventData.id, name:this.eventData.name},
        ]);
      }
    });

    firstValueFrom(this.route.paramMap).then((params: any) => {
      this.id = params.get('id');
      this.id ? this.getData() : this.router.navigateByUrl('u/master-event');
    });
  }

  getData() {
    const epLeaderboard = `${this.endpoint}/${this.id}/participants/leaderboard`;
    this.api.getAll2({}, epLeaderboard).then(
      (res) => {
        if (res.success) {
          this.list = res.data;
        } else {
          this.helper.showErrorAlert('Error', res.message ?? 'Failed to fetch leaderboard data.');
        }
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', 'Failed to fetch leaderboard data.');
      }
    );
  }

}
