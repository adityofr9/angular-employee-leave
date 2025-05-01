import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { PopupBannerComponent } from './popup-banner/popup-banner.component';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { HelperService } from 'src/app/services/helper.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, OnChanges {
  endpoint: any = events_endpoint.events;

  list: any;

  Query: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: '',
    }
  );

  @Input() idParent: any;

  constructor(
    private api: EventsService,
    private helper: HelperService,
    private dialog: DialogService,
  ) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['idParent'] && changes['idParent'].currentValue)
    ) {
      this.endpoint = events_endpoint.events;
      this.endpoint = this.endpoint + '/' + this.idParent + '/banners';
      // this.getData();
    }
  }

  async addNew(data?: any) {
    const form = this.dialog.open(PopupBannerComponent, {
      width: '80%',
      styleClass: 'custom-dialog',
      data: {
        data: data,
        id: this.idParent
      },
      autoZIndex: false,
    });

    await firstValueFrom(form.onClose).then((res) => {
      if (res === 'success') {
        // this.getData();
      }
    });
    return;
  }

  getData() {
    this.api.getAll(this.Query, this.endpoint).then(
      (res) => {
        this.list = res.data.result;
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', 'Failed to fetch banner data.');
      }
    );
  }

  onEdit(data: any) {
    this.addNew(data);
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
        this.api.delete(data.id, this.endpoint).then(
          (res) => {
            if (res.success) {
              this.helper.showSuccessAlert('Deleted', 'Banner has been deleted.');
              // this.getData();
            }
          },
          (err) => {
            console.log(err);
            this.helper.showErrorAlert('Error', 'Failed to delete banner.');
          }
        );
      }
    });
  }

  onStatusChange(data: any) {
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
        this.api.put_formdata(null, upBanner_ep, payload).then(
          (res) => {
            if (res.success) {
              this.helper.showSuccessAlert('Change', res.message ?? 'Banner status has been changed.');
              setTimeout(() => {
                // this.getData();
              }, 500);
            } else {
              data.status = !data.status;
              this.helper.showErrorAlert('Error', res.message ?? 'Failed to change banner status.');
            }
          },
          (err) => {
            console.log(err);
            data.status = !data.status;
            this.helper.showErrorAlert('Error', err.message ?? 'Failed to change banner status.');
          }
        );
      } else {
        data.status = !data.status;
        this.helper.showErrorAlert('Error', 'Failed to change banner status.');
      }
    });
  }

}
