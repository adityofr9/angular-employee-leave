import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import { DialogService } from 'primeng/dynamicdialog';
import { debounceTime, distinctUntilChanged, firstValueFrom, map } from 'rxjs';
import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';

import { EventDetail } from 'src/app/api/events/event.model';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { HelperService } from 'src/app/services/helper.service';
import { PopoupCreateComponent } from '../popoup-create/popoup-create.component';
import { PopupRsvpComponent } from './popup-rsvp/popup-rsvp.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/api/auth/auth.service';
import { BoothComponent } from '../booth/booth.component';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  endpoint = events_endpoint.events;

  id:any;
  data: EventDetail | any;

  searchRsvp = new FormControl('');
  rsvpList: any[] = [];
  Query: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: '',
      sortBy: '',
      direction: 'desc',
      isElastic: true
    }
  );

  mainData: any;

  isDownload: boolean = false;

  isLoadingTmpRSVP: boolean = false;
  isLoadingExpRSVP: boolean = false;

  minDate: any | Date;
  maxDate: any | Date;

  role: string = '';

  paramSubs: any;
  userSubs: any;
  searchSubs: any;

  @ViewChild(BoothComponent) BoothComponent!: BoothComponent;

  constructor(
    private api: EventsService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    public dialogService: DialogService,
    private helper: HelperService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.paramSubs = this.route.paramMap.subscribe(params => {
      this.id = params.get('id');

      if (this.id) {
      this.getById();
      this.getRSVP();
      } else {
      this.router.navigate(['u/master-event']);
      }
    });

    this.userSubs = this.auth.users$.subscribe((res: any) => {
      if (res) {
        this.role = res.role;
      }
    });

    this.searchSubs = this.searchRsvp.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged() // Prevent duplicate requests
      )
      .subscribe((searchTerm) => {
        this.Query.keyword = searchTerm ?? '';
        this.getRSVP();
      });
  }

  ngOnDestroy() {
    this.searchSubs.unsubscribe();
    this.userSubs.unsubscribe();
    this.paramSubs.unsubscribe();
  }

  getById(){
    this.api.getId(this.id,this.endpoint).then(
      res => {
        if (res.success) {
          this.data = res.data;
          this.mainData = (({ name, startedAt, endedAt, status, media }) => ({ name, startedAt, endedAt, status, media }))(this.data ?? {});
          this.mainData.users = this.data.users.map((e: any) => e.cin);
          this.helper.setBreadcumb([{id:this.id, name:res.data.name}]);
          this.helper.setStorage('eventData', {
            id: this.id,
            name: res.data.name,
            status: res.data.status,
            ...this.mainData,
          });

          const startedAt = new Date(this.data.startedAt);
          startedAt.setDate(startedAt.getDate() - 1);
          this.minDate = startedAt;
          this.maxDate = new Date(this.data.endedAt);
        }
      },
      err => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? 'Error while fetching data');
      }
    )
  }

  async onEdit() {
    const alert = this.dialogService.open(PopoupCreateComponent, {
      width: '80%',
      contentStyle: {
        'overflow': 'visible',
      },
      data: {
        roles: this.role,
        data: this.data
      },
      autoZIndex: false,
    });

    await firstValueFrom(alert.onClose).then((res: any) => {
      if (res == 'success') {
        this.getById();
        this.BoothComponent.getBooths();
      }
    });
    return;
  }

  async addNew() {
    const form = this.dialogService.open(PopupRsvpComponent, {
      width: '80%',
      styleClass: 'custom-dialog',
      data: {
        data: this.data,
      },
      autoZIndex: false,
    });

    await firstValueFrom(form.onClose).then((res) => {
      if (res === 'success') {
        this.getRSVP();
      }
    });
    return;
  }

  async editRSVP(data?: any) {
    const form = this.dialogService.open(PopupRsvpComponent, {
      width: '80%',
      styleClass: 'custom-dialog',
      data: {
        data: this.data,
        rsvpData: data
      },
      autoZIndex: false,
    });

    await firstValueFrom(form.onClose).then((res) => {
      if (res === 'success') {
        this.getRSVP();
      }
    });
    return;
  }

  deleteRSVP(data: any) {
    const popupData : any = {
      type: 'warning',
      title: '',
      message: 'Are you sure <br>you want to delete this data?',
      button: 'Yes',
    }

    const rsvpEp = this.endpoint + '/' + this.id + '/participants';
    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
        this.api.delete(data.id, rsvpEp).then(
          (res) => {
            if (res.success) {
              this.helper.showSuccessAlert('Deleted', 'RSVP data has been deleted.');
              this.getRSVP();
            }
          },
          (err) => {
            console.log(err);
            this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to delete RSVP data.');
          }
        );
      }
    });

  }

  getRSVP(){
    const rsvpEp = this.endpoint + '/' + this.id + '/participants';
    this.api.getAll(this.Query,rsvpEp).then(
      res => {
        if (res.success) {
          let response: any = res.data?.result;
          response = response.map((item: any) => {
            return {
              ...item,
              initials: item.userName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2),
            };
          });

          this.rsvpList = response;
        } else {
          this.rsvpList = [];
          this.helper.showErrorAlert('Error', 'Failed to fetch participants data.');
        }
      },
      err => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Error while fetching data');
      }
    )
  }

  clearfilter() {

  }

  // MARK: QR Code Generator
  downloadQRCode() {
    if (this.data?.qrImage) {
      const downloadingQR = this.http.get(this.data?.qrImage, { responseType: 'blob' }).subscribe({
        next: (blob: Blob) => {
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = `Presensi_${this.data.name}.jpeg`;
          a.click();
          URL.revokeObjectURL(objectUrl);
          downloadingQR.unsubscribe();
        },
        error: (err) => {
          console.error('Error downloading the image', err);
          downloadingQR.unsubscribe();
        }
      });
    }
  }

  downloadTemplateRSVP() {
    this.isLoadingTmpRSVP = true;
    const epExportRSVP = this.endpoint + '/' + this.id +'/participants/download-template';
    this.api.downloadFile({}, epExportRSVP).then(
      res => {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Template RSVP MIE.xlsx'); // or any other extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.helper.showSuccessAlert('Success', 'Template RSVP has been downloaded.');
        setTimeout(() => {
          this.isLoadingTmpRSVP = false;
        }, 500);
      },
      err => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to download template RSVP.');
        setTimeout(() => {
          this.isLoadingTmpRSVP = false;
        }, 500);
      }
    );
  }

  exportRSVP() {
    this.isLoadingExpRSVP = true;
    const epExportRSVP = this.endpoint + '/' + this.id +'/participants/export';
    this.api.downloadFile({}, epExportRSVP).then(
      res => {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'export_event_rsvp.xlsx'); // or any other extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.helper.showSuccessAlert('Success', 'RSVP has been exported.');
        setTimeout(() => {
          this.isLoadingExpRSVP = false;
        }, 500);
      },
      err => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to export RSVP.');
        setTimeout(() => {
          this.isLoadingExpRSVP = false;
        }, 500);
      }
    );
  }

  importRSVP() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.accept = '.xlsx, .xls';
    input.click();

    input.addEventListener('change', async (event: any) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const payload = {
          file: file
        }
        const epImport = this.endpoint + '/' + this.id + '/participants/import';
        this.api.post_formdata(payload, epImport).then(
          res => {
            if (res.success) {
              this.helper.showSuccessAlert('Success', res.message ?? 'Data has been imported.');
              this.getRSVP();
            } else {
              this.helper.showErrorAlert('Error', res.message ?? 'Failed to import data.');
            }
          },
          err => {
            console.error(err);
            this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to import data.');
          }
        );
      }
    });

    return;
  }

}
