import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { users_endpoint, UserService } from 'src/app/api/user/user.service';
import { Permissions } from 'src/app/core/models/general.model';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { ROUTES } from 'src/app/layout/menu-item';
import { HelperService, Paginator, Paginator_m } from 'src/app/services/helper.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  endpoint = users_endpoint.user;

  list: any[] = [];
  listSearch: any[] = [];

  Query: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: 15,
      sortBy: 'name',
      direction: 'asc',
      isElastic: true
    });
  paginator = Object.assign(
    {},
    Paginator,
    {
      limit: 15
    });
  totalItems: any = 0;

  previousSortField: string = '';
  previousSortOrder: number = 0;

  permission = '';
  state_permision = Permissions;
  hasFilter: boolean = false;

  constructor(
    readonly title: Title,
    private api: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private helper: HelperService,
    private permissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {
      this.permission = this.helper
        .findRouteByTitle(ROUTES, 'Master User')
        .toUpperCase();

      this.permissionsService
        .hasPermission(this.permission + this.state_permision.FILTER)
        .then((hasPermission) => {
          if (hasPermission) {
            this.hasFilter = true;
          } else {
            this.hasFilter = false;
          }
          return;
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

  getData(isEmptySearch: boolean = false) {
    this.api.getAll(this.Query, this.endpoint).then(
      (res) => {
        if (res.success) {
          this.list = res.data.result;
          // this.listSearch = isEmptySearch ? [] : res?.data?.result?.slice(0, 5).sort((a, b) => a.name.localeCompare(b.name));
          setTimeout(() => {
            this.listSearch = this.helper.sortByKeyword(res?.data?.result, this.Query.keyword, 'name');
          }, 200);
          const total = Number(res.data.totalItems);
          this.totalItems = new Intl.NumberFormat('en-US').format(total);
          this.paginator = this.helper.convertPaginator(res.data, this.Query);
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

  searchData(data: any) {
    this.Query.keyword = data?.trim() || '';
    if (data === '' || data === null || data === undefined) {
      this.Query.keyword = '';
      // this.getData(true);
    } else {
      // this.getData();
    }
  }

  navigateSelected(data: any) {
    const selectedId = data?.value?.id;
    const selectedName = data?.value?.name;
    if (selectedId && selectedName) {
      this.Query.keyword = selectedName;
      // this.getData();
    }
  }
}
