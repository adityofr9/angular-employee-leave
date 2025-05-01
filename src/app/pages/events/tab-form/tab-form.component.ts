import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { PopupFormComponent } from './popup-form/popup-form.component';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { HelperService } from 'src/app/services/helper.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'tab-form',
  templateUrl: './tab-form.component.html',
  styleUrls: ['./tab-form.component.scss']
})
export class TabFormComponent implements OnInit, OnChanges {
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
    private dialog: DialogService
  ) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['idParent'] && changes['idParent'].currentValue)
    ) {
      this.endpoint = events_endpoint.events;
      this.endpoint = this.endpoint + '/' + this.idParent + '/form';
      // this.getData();
    }
  }

  async addNew(data?: any) {
    const form = this.dialog.open(PopupFormComponent, {
      width: '80%',
      contentStyle: {
        'overflow': 'visible'
      },
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
    this.api.getAll({}, this.endpoint).then(
      (res) => {
        this.list = res.data;
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', 'Failed to fetch form data.');
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
              this.helper.showSuccessAlert('Deleted', 'Form has been deleted.');
              // this.getData();
            }
          },
          (err) => {
            console.log(err);
            this.helper.showErrorAlert('Error', 'Failed to delete form.');
          }
        );
      }
    });
  }

  onStatusChange(data:any) {
    if (data && data.id) {
      const epStatus = this.endpoint + '/' + data.id + '/toggle-status';
      const params = {
        isActive: data.status,
      }
      this.api.put_withParam(null, epStatus, params).then(
        res => {
          if (res.success) {
            this.helper.showSuccessAlert('Success', res.message ?? 'Form status has been updated.');
            setTimeout(() => {
              // this.getData();
            }, 500);
          } else {
            data.status = !data.status;
          }
        },
        err => {
          console.error(err);
          data.status = !data.status;
          this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to update form status');
        }
      );
    } else {
      data.status = !data.status;
      this.helper.showErrorAlert('Error', 'Failed to update form status');
    }
  }

}
