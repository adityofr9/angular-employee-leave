import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { firstValueFrom } from 'rxjs';
import { menus_endpoint, MenuService } from 'src/app/api/menu/menu.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { HelperService, Paginator, Paginator_m } from 'src/app/services/helper.service';
import { PopoupEditComponent } from '../popoup-edit/popoup-edit.component';
import { NgxPermissionsService } from 'ngx-permissions';
import { ROUTES } from 'src/app/layout/menu-item';
import { Permissions } from 'src/app/core/models/general.model';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  endpoint = menus_endpoint.menus;

  list: any[] = [];

  Query: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: 15,
      sortBy: 'id',
      direction: 'desc'
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

  listSearch: any;
  QuerySearch: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: 5,
      sortBy: 'name',
      direction: 'asc',
    }
  );

  permission = '';
  state_permision = Permissions;
  hasFilter: boolean = false;

  constructor(
    readonly title: Title,
    private api: MenuService,
    private router: Router,
    private route: ActivatedRoute,
    private helper: HelperService,
    public dialogService: DialogService,
    private permissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {
    this.permission = this.helper
      .findRouteByTitle(ROUTES, 'Master Menu')
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

  onChangeStatus(data: any) {
    const popupData : any = {
      type: 'warning',
      title: '',
      message: 'Are you sure <br>you want to change this data?',
      button: 'Yes',
    }

    const payload = {
      isActive: data.status
    };

    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
        const upBanner_ep = this.endpoint + '/' + data.id + '/toggle-status';
        this.api.put_withParam(null, upBanner_ep, payload).then(
          (res) => {
            if (res.success) {
              this.helper.showSuccessAlert('Change', res.message ?? 'Menu status has been changed.');
              setTimeout(() => {
                // this.getData();
              }, 500);
            }
          },
          (err) => {
            console.log(err);
            data.status = !data.status;
            this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to change menu status.');
          }
        );
      } else {
        data.status = !data.status;
      }
    });
  }

  async onEdit(data: any) {
    const alert = this.dialogService.open(PopoupEditComponent, {
      width: '80%',
      contentStyle: {
        // 'overflow': 'visible',
      },
      data: data,
      autoZIndex: false,
    });

    await firstValueFrom(alert.onClose).then((res) => {
      if (res == 'success') {
        // this.getData();
      }
    });
    return;
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
    console.log('data search', data);
    this.Query.keyword = data?.trim() || '';
    if (data === '' || data === null || data === undefined) {
      this.Query.keyword = '';
      this.getData(true);
    } else {
      // this.getData();
    }
  }

  navigateSelected(data: any) {
    console.log('data selected', data);

    const selectedId = data?.value?.id;
    const selectedName = data?.value?.name;
    if (selectedId && selectedName) {
      this.Query.keyword = selectedName;
      // this.getData();
    }
  }
}
