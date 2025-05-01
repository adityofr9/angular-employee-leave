import { Component, OnInit } from '@angular/core';import { DialogService } from 'primeng/dynamicdialog';
import { PopupFormComponent } from '../popup-form/popup-form.component';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { HelperService } from 'src/app/services/helper.service';
import { StorageMap } from '@ngx-pwa/local-storage';


@Component({
  selector: 'app-detail-form',
  templateUrl: './detail-form.component.html',
  styleUrls: ['./detail-form.component.scss']
})
export class DetailFormComponent implements OnInit {
  endpoint = events_endpoint.events;

  idEvent:any;
  eventData: any;
  idForm:any;
  data: any | undefined;

  listResponses: any[] = [];
  dateSyncResponses: any = '';
  isSyncResponses: boolean = false;

  isLoadingExpRes: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: EventsService,
    private helper: HelperService,
    private dialog: DialogService,
    private storage: StorageMap
  ) { }

  ngOnInit() {
    lastValueFrom(this.storage.get('eventData')).then((res:any)=>{
      if (res) {
        this.eventData = res;
      }
    });

    firstValueFrom(this.route.paramMap).then((params: any) => {
      this.idEvent = params.get('id');
      this.idForm = params.get('subId');
      if (this.idEvent && this.idForm) {
        this.getDetail();
        this.getResponses();
      } else {
        this.router.navigateByUrl('u/master-event');
      }
    });
  }

  getDetail() {
    const epDetail = `${this.endpoint}/${this.idEvent}/form`;
    this.api.getId(this.idForm, epDetail).then(
      res => {
        if (res.success) {
          this.data = res.data;
          this.helper.setBreadcumb([
            {id:this.idEvent, name:this.eventData.name},
            {id:this.idForm, name:res.data.title}
          ]);
        } else {
          this.helper.showErrorAlert('Error', res.message ?? 'Failed to fetching data');
        }
      },
      err => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? 'Failed to fetching data');
      }
    )
  }

  async onEdit() {
    const formData = { ...this.data, id: this.idForm };
    const form = this.dialog.open(PopupFormComponent, {
      width: '80%',
      contentStyle: {
        'overflow': 'visible'
      },
      data: {
        data: formData,
        id: this.idEvent
      },
      autoZIndex: false,
    });

    await firstValueFrom(form.onClose).then((res) => {
      if (res === 'success') {
        this.getDetail();
      }
    });
    return;
  }

  // MARK: Get quiz data
  getResponses(isSync: boolean = false) {
    this.listResponses = [];
    this.isSyncResponses = true;

    const epQuiz = this.endpoint + '/' + this.idEvent + '/form/' + this.idForm + '/form-responses';
    this.api.getAll2('', epQuiz).then(
      (res) => {
        if (res.success) {
          this.listResponses = res.data;
          this.listResponses.forEach((item: any) => {
            item.labelTitle = this.helper.truncateText(item.title, 50);
          });
          this.dateSyncResponses = new Date();
          isSync && this.helper.showSuccessAlert('Success', 'Responses has been synced.');
          setTimeout(() => {
            this.isSyncResponses = false;
          }, 500);
        }
      },
      (err) => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Error while fetching quiz.');
        setTimeout(() => {
          this.isSyncResponses = false;
        }, 500);
      }
    );
  }

  exportResponses() {
    this.isLoadingExpRes = true;
    const epExpResponses = this.endpoint + '/' + this.idEvent +'/form/' + this.idForm +'/export-response';
    this.api.downloadFile({}, epExpResponses).then(
      res => {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'export_event_form_response.xlsx'); // or any other extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.helper.showSuccessAlert('Success', 'Recent Responses has been exported.');
        setTimeout(() => {
          this.isLoadingExpRes = false;
        }, 500);
      },
      err => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to export Recent Responses.');
        setTimeout(() => {
          this.isLoadingExpRes = false;
        }, 500);
      }
    );
  }
}
