import { firstValueFrom } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { DialogService } from 'primeng/dynamicdialog';

import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import {
  events_endpoint,
  EventsService,
} from 'src/app/api/events/events.service';
import { HelperService } from 'src/app/services/helper.service';
import { PopoupCreateComponent } from '../popoup-create/popoup-create.component';
import { ROUTES } from 'src/app/layout/menu-item';
import { NgxPermissionsService } from 'ngx-permissions';
import { Permissions } from 'src/app/core/models/general.model';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  endpoint = events_endpoint.events;

  list: any;

  Query: QueryParams = Object.assign({}, QueryData, {
    limit: 9,
    sortBy: 'createdAt',
    direction: 'desc',
    isElastic: true
  });
  paginator: any;

  filterFields: any[] = [
    {
      name: 'Start Date',
      slug: 'startDate',
      placeholder: 'Start Date',
      type: 'date',
      value: null,
      options: {
        minDate: null,
        maxDate: null,
      },
    },
    {
      name: 'End Date',
      slug: 'endDate',
      placeholder: 'End Date',
      type: 'date',
      value: null,
      options: {
        minDate: null,
        maxDate: null,
      },
    },
  ];

  buttonActions: any[] = [
    // {
    //   name: 'Create',
    //   iconCustom: 'assets/icon/icon-plus.svg',
    //   slug: 'create',
    //   customClass: '',
    // },
  ];
  hasFilter: boolean = false;
  hasSearch: boolean = false;

  listSearch: any;
  QuerySearch: QueryParams = Object.assign({}, QueryData, {
    limit: 5,
    sortBy: 'name',
    direction: 'asc',
  });

  permission = '';
  state_permision = Permissions;

  constructor(
    readonly title: Title,
    private api: EventsService,
    private router: Router,
    private route: ActivatedRoute,
    public helper: HelperService,
    public dialogService: DialogService,
    private permissionsService: NgxPermissionsService
  ) {}

  ngOnInit() {
    this.initParams();
    // this.getData();
    this.permission = this.helper
      .findRouteByTitle(ROUTES, 'Master Event')
      .toUpperCase();

    this.permissionsService
      .hasPermission(this.permission + this.state_permision.CREATE)
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

    this.permissionsService
      .hasPermission(this.permission + this.state_permision.FILTER)
      .then((hasPermission) => {
        if (hasPermission) {
          this.hasFilter = true;
          this.hasSearch = true;
        } else {
          this.hasFilter = false;
          this.hasSearch = false;
        }
        return;
      });
  }

  initParams() {
    const param: any = this.route.snapshot.queryParams;

    if (param && Object.keys(param).length > 0) {
      const filteredParam = Object.keys(param).reduce((acc: any, key) => {
        if (param[key] !== '' && param[key] !== null) {
          acc[key] = param[key];
        }
        return acc;
      }, {});
      this.Query = { ...this.Query, ...filteredParam };
    }
  }

  getData() {
    this.api.getAll(this.Query, this.endpoint).then(
      (res) => {
        this.list = res.data;
        // this.listSearch = res?.data?.result?.slice(0, 5).sort((a, b) => a.name.localeCompare(b.name));
        setTimeout(() => {
          this.listSearch = this.helper.sortByKeyword(res?.data?.result, this.Query.keyword, 'name');
        }, 200);
        this.paginator = this.helper.convertPaginator(res.data, this.Query);
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', 'Failed to fetch event data.');
      }
    );
  }

  onSearch(value: any) {
    this.Query.keyword = value;
    // this.getData();
  }

  onEdit(data: any) {
    this.router.navigateByUrl(
      '/u/' + this.helper.toSlug(this.title.getTitle()) + '/edit/' + data.id
    );
  }

  onShow(data: any) {
    this.router.navigateByUrl(
      '/u/' +
        this.helper.toSlug(this.title.getTitle()) +
        '/' +
        data.id +
        '/participants'
    );
  }

  onDelete(data: any) {
    const popupData: any = {
      type: 'warning',
      title: '',
      message: 'Are you sure <br>you want to delete this data?',
      button: 'Yes',
    };

    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
        this.api.delete(data.id, this.endpoint).then(
          (res) => {
            if (res.success) {
              this.helper.showSuccessAlert(
                'Deleted',
                'Event has been deleted.'
              );
              // this.getData();
            }
          },
          (err) => {
            console.log(err);
            this.helper.showErrorAlert('Error', 'Failed to delete event.');
          }
        );
      }
    });
  }

  onChangeStatus(data: any) {
    const popupData: any = {
      type: 'warning',
      title: '',
      message: 'Are you sure <br>you want to change this data?',
      button: 'Yes',
    };

    const payload = {
      isActive: data.status,
    };

    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
        const upEvent_ep = this.endpoint + '/' + data.id + '/toggle-status';
        this.api.put_withParam(null, upEvent_ep, payload).then(
          (res) => {
            if (res.success) {
              this.helper.showSuccessAlert(
                'Change',
                res.message ?? 'Event status has been changed.'
              );
              setTimeout(() => {
                // this.getData();
              }, 500);
            } else {
              data.status = !data.status;
              this.helper.showErrorAlert(
                'Error',
                res.message ?? 'Failed to change event status.'
              );
            }
          },
          (err) => {
            console.error(err);
            data.status = !data.status;
            this.helper.showErrorAlert(
              'Error',
              err.message ?? 'Failed to change event status.'
            );
          }
        );
      } else {
        data.status = !data.status;
        this.helper.showErrorAlert('Error', 'Failed to change event status.');
      }
    });
  }

  showAlert(id: any) {}

  onPageChange(event: any) {
    this.Query.limit = event.rows;
    // this.getData();
  }

  pagination(data: any) {
    this.Query.limit = data.limit;
    this.Query.pages = data.page;
    // this.getData();
  }

  filtered(data: any) {
    this.Query = { ...this.Query, ...data };
    // this.getData();
  }

  async runActionBtn(slug: any) {
    if (slug.data == 'create') {
      // const formFields = [
      //   { name: 'name', label: 'Event name', type: 'text', required: true },
      //   { name: 'assign', label: 'Assign to', type: 'multiple-select', required: false },
      //   { name: 'startedAt', label: 'Start date (yyyy/mm/dd)', type: 'date', required: true },
      //   { name: 'endedAt', label: 'End date (yyyy/mm/dd)', type: 'date', required: true }
      // ];
      // this.helper.showForm('Create Event', formFields, []);

      const alert = this.dialogService.open(PopoupCreateComponent, {
        width: '80%',
        contentStyle: {
          overflow: 'visible',
        },
      });

      await firstValueFrom(alert.onClose).then((res) => {
        if (res == 'success') {
          // this.getData();
        }
      });
      return;
    }
  }

  searchData(data: any) {
    // this.QuerySearch.keyword = data?.trim() || '';
    // this.getSearchData();
    this.Query.keyword = data?.trim() || '';
    // this.getData();
  }

  getSearchData() {
    this.api.getAll(this.QuerySearch, this.endpoint).then(
      (res) => {
        this.listSearch = res.data.result;
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', 'Failed to search event data.');
      }
    );
  }

  navigateSelected(data: any) {
    const selectedId = data?.value?.id;
    if (selectedId) {
      this.router.navigateByUrl('/u/master-event/' + selectedId);
      this.Query.keyword = '';
    }
  }
}
