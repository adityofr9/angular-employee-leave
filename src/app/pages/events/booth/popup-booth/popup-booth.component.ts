import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FormControl } from '@angular/forms';
import { HelperService } from 'src/app/services/helper.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { booths_endpoint, BoothService } from 'src/app/api/booth/booth.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { events_endpoint } from 'src/app/api/events/events.service';


@Component({
  selector: 'app-popup-booth',
  templateUrl: './popup-booth.component.html',
  styleUrls: ['./popup-booth.component.scss']
})
export class PopupBoothComponent implements OnInit {
  endpoint = booths_endpoint.booths;
  endpoint_active = booths_endpoint.active_booths;
  endpoint_event = events_endpoint.events;

  Query: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: '',
      sortBy: '',
      direction: 'asc',
      isElastic: true,
    }
  );

  isLoading: boolean = false;

  searchBooth = new FormControl('');
  optData: any[] = [];
  rows: number = 0;

  selectedIds: number[] = [];

  idEvent: any;

  constructor(
    private ref: DynamicDialogRef,
    private helper: HelperService,
    private dialog:DynamicDialogConfig,
    private api: BoothService,
  ) { }

  ngOnInit() {
    this.idEvent = this.dialog?.data?.id;
    this.getOptBooth();

    this.searchBooth.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged() // Prevent duplicate requests
      )
      .subscribe((searchTerm) => {
        this.Query.keyword = searchTerm ?? '';
        this.getOptBooth();
      });
  }

  getOptBooth() {
    const params = {
      ...this.Query,
      eventId : this.idEvent
    }
    this.api.getAll2(params, this.endpoint_active).then(
      (res) => {
        if (res.success) {
          this.optData = res?.data?.map((item: any) => {
            return {
              label: item.name.substring(0, 50) + (item.name.length > 50 ? ' ...' : ''),
              state: this.selectedIds.includes(item.id), // temp state
              ...item,
            };
          });
          this.rows = Math.ceil(this.optData.length / 2);
        } else {
          this.optData = [];
        }
      },
      (err) => {
        console.log(err);
        this.optData = [];
      }
    );
  }

  onToggleChange(event: any, id: number): void {
    if (event.checked) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter(selectedId => selectedId !== id);
    }
  }

  onSubmit(): void {
    if (this.isLoading == false) {
      if (this.selectedIds.length > 0) {
        this.isLoading = true;
        this.update();
      } else {
        this.helper.showErrorAlert('Error', 'Failed to add Booth.');
      }
    }

  }

  onClose(): void {
    this.selectedIds = [];
    this.searchBooth.reset();
    this.ref.close();
  }

  update() {
    const payload = {
      boothIds: this.selectedIds
    };
    const eventBooth_ep = this.endpoint_event + '/' + this.dialog.data.id + '/booths';
    this.api.post(payload, eventBooth_ep).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', res.message ?? 'Booth has been added to event.');

          this.selectedIds = [];
          this.searchBooth.reset();
          this.ref.close('success');
        }
        this.isLoading = false;
      },
      err => {
        console.log(err);
        this.isLoading = false;
        this.helper.showErrorAlert('Error', err.message ?? 'Failed to add booth to event.');
      }
    )
  }
}
