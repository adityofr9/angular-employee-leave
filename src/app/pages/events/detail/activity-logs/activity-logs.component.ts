import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageMap } from '@ngx-pwa/local-storage';
import { DialogService } from 'primeng/dynamicdialog';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { HelperService, Paginator, Paginator_m } from 'src/app/services/helper.service';
import moment from 'moment';

@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss']
})
export class ActivityLogsComponent implements OnInit {
  endpoint = events_endpoint.events;

  id: any;
  eventData: any;
  list: any[] = [];

  Query: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: 15,
      sortBy: 'createdAt',
      direction: 'desc',
      isElastic: true,
    });
  paginator = Object.assign(
    {},
    Paginator,
    {
      limit: 15
    });
  totalItems: any = 0;

  buttonActions: any[] = [
    // {
    //   name: '',
    //   icon: 'pi-filter',
    //   slug: 'filter',
    //   customClass: 'px-5',
    // },
    {
      name: 'Download',
      icon: 'pi-download',
      slug: 'download',
      customClass: '',
    },
  ];

  previousSortField: string = '';
  previousSortOrder: number = 0;

  isCollapseFilter: boolean = true;
  rangeDates: any;
  actionList: any[] = [];
  sourceList: any[] = [];
  userList: any[] = [];
  actionValue: any;

  constructor(
    readonly title: Title,
    private api: EventsService,
    private router: Router,
    private route: ActivatedRoute,
    private helper: HelperService,
    public dialogService: DialogService,
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
    // this.initParams();
    // this.getData();
  }

  initParams() {
    const param:any = this.route.snapshot.queryParams;

    if (param && Object.keys(param).length > 0) {
      const filteredParam = Object.keys(param).reduce((acc:any, key) => {
        if (param[key] !== '' && param[key] !== null) {
          acc[key] = param[key];
        }
        return acc;
      }, {});
      this.Query = { ...this.Query, ...filteredParam };
    }
  }

  getData() {
    const epActivity = `${this.endpoint}/${this.id}/activity-logs`;
    this.api.getAll(this.Query, epActivity).then(
      (res) => {
        if (res.success) {
          this.list = res.data.result;
          this.list = this.list.map((item:any) => {
            return {
              ...item,
              labelUser: this.helper.truncateText(item.user, 30),
            }
          });
          this.paginator = this.helper.convertPaginator(res.data, this.Query);

          if (res.attributes && res.attributes.length > 0) {
            if (res.attributes[0].actions) {
                this.actionList = res.attributes[0].actions
                .filter((items: any) => items.id !== null && items.name !== 'All')
                .map((items: any) => ({
                  label: items.name,
                  value: items.id,
                  selected: false
                }));
            } else {
              this.actionList = [];
            }

            if (res.attributes[0].sources) {
              this.sourceList = res.attributes[0].sources
                .filter((items: any) => items.id !== null && items.name !== 'All')
                .map((items: any) => ({
                  label: items.name,
                  value: items.id,
                  selected: false
                }));
            } else {
              this.sourceList = [];
            }

            if (res.attributes[0].users) {
              this.userList = res.attributes[0].users
                .filter((items: any) => items.id !== null && items.name !== 'All')
                .map((items: any) => ({
                  label: items.name,
                  value: items.id,
                  selected: false
                }));
            } else {
              this.userList = [];
            }
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  pagination(data:Paginator_m){
    this.Query.limit = data.limit
    this.Query.pages = data.page
    // this.getData();
  }

  async runActionBtn(slug: any) {
    if (slug.data == 'download') {
      this.exportLiveQ();
    } else if (slug.data == 'filter') {
      this.isCollapseFilter = !this.isCollapseFilter;
    }
  }

  onSort(event: any) {
    // Cek apakah field atau arah sort benar-benar berubah
    if (this.previousSortField !== event.field || this.previousSortOrder !== event.order) {
      this.Query.sortBy = event.field == 'index' ? 'id' : event.field;
      this.Query.direction = event.order == 1 ? 'asc' : 'desc';
      // Update nilai sebelumnya untuk perbandingan di masa depan
      this.previousSortField = event.field;
      this.previousSortOrder = event.order;
      // Memanggil fungsi getData untuk mendapatkan data terbaru
      // this.getData();
    }
  }

  exportLiveQ() {
    // const expParams = {
    //   action: this.Query?.action ?? '',
    //   startDate: this.Query?.startDate ?? '',
    //   endDate: this.Query?.endDate ?? '',
    // };
    this.buttonActions[0].disabled = true;
    const epExpActivityLog = `${this.endpoint}/${this.id}/activity-logs/export`;
    this.api.downloadFile(this.Query, epExpActivityLog).then(
      res => {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'export_activity_logs.xlsx'); // or any other extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.helper.showSuccessAlert('Success', 'Success download Activity Logs.');
        setTimeout(() => {
          this.buttonActions[0].disabled = false;
        }, 500);
      },
      err => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to download Activity Logs.');
        setTimeout(() => {
          this.buttonActions[0].disabled = false;
        }, 500);
      }
    );
  }

  onDateSelect(event: any) {
    if (!!event && event.length > 0) {
      this.Query.startDate = event[0] ? moment(event[0]).format('YYYY-MM-DD') : '';
      this.Query.endDate = event[1] ? moment(event[1]).format('YYYY-MM-DD') : '';
    } else {
      this.Query.startDate = '';
      this.Query.endDate = '';
    }
    // this.getData();
  }

  onActionSelect(event: any) {
    this.actionValue = event.value;
    this.Query.action = this.actionValue ?? '';
    // this.getData();
  }

  filter(event: any) {
    this.Query = { ...this.Query, ...event };
    // this.getData();
  }
}
