import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PopupBoothComponent } from './popup-booth/popup-booth.component';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { HelperService } from 'src/app/services/helper.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'booth',
  templateUrl: './booth.component.html',
  styleUrls: ['./booth.component.scss']
})
export class BoothComponent implements OnInit, OnChanges {
  @Input() idParent: any;

  endpoint: any = events_endpoint.events;

  list: any;
  Query: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: '',
    }
  );

  constructor(
    private api: EventsService,
    private helper: HelperService,
    private dialog: DialogService
  ) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['idParent'] && changes['idParent'].currentValue)
    ) {
      this.endpoint = events_endpoint.events;
      this.endpoint = this.endpoint + '/' + this.idParent + '/booths';
      this.getBooths();
    }
  }

  getBooths() {
    this.api.getAll(this.Query, this.endpoint).then(
      (res) => {
        this.list = res.data;
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to fetch booth data.');
      }
    );
  }

  async addNew(data?: any) {
    const form = this.dialog.open(PopupBoothComponent, {
      width: '80%',
      height: '80%',
      styleClass: 'custom-dialog',
      data: {
        id: this.idParent
      },
      autoZIndex: false,
    });

    await firstValueFrom(form.onClose).then((res) => {
      if (res === 'success') {
        this.getBooths();
      }
    });
    return;
  }

  unAssign(data: any) {
    const popupData : any = {
      type: 'warning',
      title: '',
      message: 'Are you sure <br>you want to delete this data?',
      button: 'Yes',
    }

    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
        this.api.delete(data.boothId, this.endpoint).then(
          (res) => {
            if (res.success) {
              this.helper.showSuccessAlert('Deleted', res.message ?? 'Booth has been unaasign.');
              this.getBooths();
            }
          },
          (err) => {
            console.log(err);
            this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to unaasign booth.');
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
        const upBanner_ep = this.endpoint + '/' + data.boothId + '/toggle-status';
        this.api.put_withParam(null, upBanner_ep, payload).then(
          (res) => {
            if (res.success) {
              this.helper.showSuccessAlert('Change', res.message ?? 'Booth status has been changed.');
              setTimeout(() => {
                this.getBooths();
              }, 500);
            }
          },
          (err) => {
            console.log(err);
            data.status = !data.status;
            this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to change booth status.');
          }
        );
      } else {
        data.status = !data.status;
      }
    });
  }

}
