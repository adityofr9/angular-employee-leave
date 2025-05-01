import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { HelperService, Paginator, Paginator_m } from 'src/app/services/helper.service';
import { PopupAddMenuComponent } from '../popup-add-menu/popup-add-menu.component';
import { DialogService } from 'primeng/dynamicdialog';
import { firstValueFrom } from 'rxjs';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';

@Component({
  selector: 'list-menu-settings',
  templateUrl: './list-menu.component.html',
  styleUrls: ['./list-menu.component.scss']
})
export class ListMenuComponent implements OnInit {
  ep_form = events_endpoint.events;

  idEvent: any;

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

  buttonActions: any[] = [
    {
      name: 'Add',
      icon: 'pi-plus',
      slug: 'add',
      customClass: '',
    },
  ];

  selectedMenu: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: DialogService,
    private helper: HelperService,
    private api: EventsService,
  ) { }

  ngOnInit() {
    firstValueFrom(this.route.paramMap).then((params: any) => {
      this.idEvent = params.get('id');
      this.idEvent // && this.getData();
    });
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
    this.list = [];
    this.selectedMenu = [];

    const epCreate = this.ep_form + '/' + this.idEvent + '/event-menu';
    this.api.getAll(this.Query, epCreate).then(
      (res) => {
        if (res.success) {
          this.list = res.data.result;
          this.paginator = this.helper.convertPaginator(res.data, this.Query);
          this.selectedMenu = this.list.map((item) => item.menuId);
        } else {
          this.helper.showErrorAlert('Error', 'Failed to create menu settings data.');
        }
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to create menu settings data.');
      }
    );
  }

  async addNew(data?: any) {
    const form = this.dialog.open(PopupAddMenuComponent, {
      width: '80%',
      contentStyle: {
        'overflow': 'visible'
      },
      autoZIndex: false,
      data: {
        id: this.idEvent,
        data: data,
        selectedMenu: this.selectedMenu,
      },
    });

    await firstValueFrom(form.onClose).then((res) => {
      if (res === 'success') {
        // this.getData();
      }
    });
    return;
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
        const epDelete = this.ep_form + '/' + this.idEvent + '/event-menu';
        this.api.delete(data.id, epDelete).then(
          (res) => {
            if (res.success) {
              this.helper.showSuccessAlert('Deleted', res.message);
              // this.getData();
            } else {
              this.helper.showErrorAlert('Error', 'Failed to delete menu settings data.');
            }
          },
          (err) => {
            console.log(err);
            this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to delete menu settings data.');
          }
        );
      }
    });
  }

  pagination(data:Paginator_m){
    this.Query.limit = data.limit
    this.Query.pages = data.page
    // this.getData();
  }

}
