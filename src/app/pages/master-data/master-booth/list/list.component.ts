import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { DialogService } from 'primeng/dynamicdialog';
import { firstValueFrom } from 'rxjs';

import { booths_endpoint, BoothService } from 'src/app/api/booth/booth.service';
import { HelperService, Paginator, Paginator_m } from 'src/app/services/helper.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';

import { PopoupCreateComponent } from '../popoup-create/popoup-create.component';
import { ROUTES } from 'src/app/layout/menu-item';
import { Permissions } from 'src/app/core/models/general.model';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  endpoint = booths_endpoint.booths;

  list: any[] = [];

  Query: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: 15,
      sortBy: 'id',
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

  buttonActions: any[] = [];

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

  constructor(
    readonly title: Title,
    private api: BoothService,
    private router: Router,
    private route: ActivatedRoute,
    private helper: HelperService,
    public dialogService: DialogService,
    private permissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {
    this.permission = this.helper
      .findRouteByTitle(ROUTES, 'Master Booth')
      .toUpperCase();

    this.permissionsService
    .hasPermission(this.permission + this.state_permision.CREATE.toUpperCase())
    .then((hasPermission) => {
      if (hasPermission) {
        this.buttonActions.push({
          name: 'Create',
          iconCustom: 'assets/icon/icon-plus.svg',
          slug: 'create',
          customClass: '',
        });
      } else {
        this.buttonActions = [];
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

          this.list.forEach((item: any) => {
            item.labelName = this.helper.truncateText(item?.name, 20);
            item.labelEvent = this.helper.truncateText(item?.eventName, 20);
          });
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
    if (slug.data == 'create') {
      const alert = this.dialogService.open(PopoupCreateComponent, {
        width: '80%',

        styleClass: 'custom-dialog',
      });

      await firstValueFrom(alert.onClose).then((res) => {
        if (res == 'success') {
          // this.getData();
        }
      });
      return;
    }
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
        const changeStat_ep = this.endpoint + '/' + data.id + '/toggle-status';
        this.api.put_withParam(data.id, changeStat_ep, payload).then(
          (res) => {
            if (res.success) {
              this.helper.showSuccessAlert('Change', res.message ?? 'Booth status has been changed.');
              // this.getData();
            }
          },
          (err) => {
            data.status = !data.status;
            this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to change booth status.');
          }
        );
      } else {
        data.status = !data.status;
      }
    });
  }

  onDelete(data: any) {
    const popupData : any = {
      type: 'warning',
      title: '',
      message: 'Are you sure <br>you want to delete this data?',
      button: 'Yes',
    }

    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
        this.api.delete(data.id, this.endpoint).then((res) => {
          if (res.success) {
            this.helper.showSuccessAlert('Deleted', res.message);
            // this.getData();
          }
        });
      }
    });
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
      this.getData(true);
    } else {
      // this.getData();
    }
  }

  getSearchData() {
    this.api.getAll(this.QuerySearch, this.endpoint).then(
      (res) => {
        this.listSearch = res.data.result;
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', 'Failed to search master booth data.');
      }
    );
  }

  navigateSelected(data: any) {
    const selectedId = data?.value?.id;
    if (selectedId) {
      this.router.navigateByUrl('/u/master-booth/' + selectedId);
      this.QuerySearch.keyword = '';
    }
  }

  noPermissionDelete() {
    this.helper.showErrorAlert('Error', 'You do not have permission to delete this booth.');
  }
}
