import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { booths_endpoint, BoothService } from 'src/app/api/booth/booth.service';
import { HelperService } from 'src/app/services/helper.service';
import { PopoupCreateComponent } from '../popoup-create/popoup-create.component';
import { firstValueFrom } from 'rxjs';
import { PopupSettingsComponent } from '../popup-settings/popup-settings.component';
import { PopupUploadComponent } from '../popup-upload/popup-upload.component';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { AuthService } from 'src/app/api/auth/auth.service';
import { Permissions } from 'src/app/core/models/general.model';
import { ROUTES } from 'src/app/layout/menu-item';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  endpoint = booths_endpoint.booths;

  id:any;
  data: any | undefined;
  listAttendees: any[] = [];
  QueryAttend: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: '',
      sortBy: '',
      direction: ''
    });
  isLoadingExpAttend: boolean = false;

  listQuiz: any[] = [];
  QueryQuiz: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: 4,
      sortBy: '',
      direction: ''
    });

  listReviews: any[] = [];
  QueryReview: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: '',
      sortBy: '',
      direction: ''
    });
  isLoadingExpReview: boolean = false;

  reviewOn: boolean = false;
  quizOn: boolean = false;

  dateSync: any = '';
  isSync: boolean = false;
  dateSyncReview: any = '';
  isSyncReview: boolean = false;

  role: string = '';

  userSubs: any;

  permission = '';
  state_permision = Permissions;

  today: Date = new Date();
  endDate: Date | any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: BoothService,
    private auth: AuthService,
    public helper: HelperService,
    public dialogService: DialogService,
  ) {}

  ratingValue: number = 4;

  ngOnInit() {
    this.permission = this.helper
      .findRouteByTitle(ROUTES, 'Master Booth')
      .toUpperCase();

    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');

      // if (this.id) {
        this.getById();
        this.getReview();
        // this.getQuiz();
      // } else {
      //   this.router.navigate(['u/master-event']);
      // }
    });
    this.userSubs = this.auth.users$.subscribe((res: any) => {
      if (res) {
        this.role = res.role;
      }
    });
  }

  ngOnDestroy() {
    this.userSubs.unsubscribe();
  }

  getById(){
    this.api.getId(this.id,this.endpoint).then(
      res => {
        if (res.success) {
          this.data = res.data;
          this.quizOn = this.data?.quizEnabled;
          this.reviewOn = this.data?.reviewsEnabled;
          this.listAttendees = this.data?.attendance.map((item: any) => {
            return {
              ...item,
              initials: item.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2),
            };
          }) ?? [];
          this.helper.setBreadcumb([{id:this.id, name:res.data.name}]);
          this.listQuiz = this.data?.quizzes ?? [];
          // this.listReviews = this.data?.reviews ?? [];
          this.dateSync = new Date();
          this.dateSyncReview = new Date();

          this.endDate = this.data?.eventEndDate ? new Date(this.data?.eventEndDate) : new Date(this.data?.endedAt);

          if (this.data?.admins) {
            this.data.admins = this.data.admins.map((admin: any) => ({
              ...admin,
              label: admin.cin + ' - ' +admin.name
            }));
          }
        }
      },
      err => {
        this.helper.showErrorAlert('Error', err.message ?? 'Error while fetching data');
      }
    )
  }

  async onEdit() {
    const alert = this.dialogService.open(PopoupCreateComponent, {
      width: '80%',
      styleClass: 'custom-dialog',
      data: {
        roles: this.role,
        data: this.data,
        id: this.id
      },
      autoZIndex: false,
    });

    await firstValueFrom(alert.onClose).then((res) => {
      if (res == 'success') {
        this.getById();
      }
    });
    return;
  }

  toggleReview(event: any) {
    const epReview = this.endpoint + '/' + this.id +'/toggle-reviews';
    const params = {
      enabled: event.checked,
    }
    this.api.put_withParam(null, epReview, params).then(
      res => {
        if (res.success) {
          this.helper.showSuccessAlert('Success', res.message ?? 'Review status updated');
        } else {
          this.reviewOn = !this.reviewOn;
        }
      },
      err => {
        console.log(err);
        this.reviewOn = !this.reviewOn;
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Error while updating review status');
      }
    );
  }

  toggleQuizzes(event: any) {
    const epQuiz = this.endpoint + '/' + this.id +'/toggle-quiz';
    const params = {
      enabled: event.checked,
    }
    this.api.put_withParam(null, epQuiz, params).then(
      res => {
        if (res.success) {
          this.helper.showSuccessAlert('Success', res.message ?? 'Quiz status updated');
        } else {
          this.quizOn = !this.quizOn;
        }
      },
      err => {
        console.log(err);
        this.quizOn = !this.quizOn;
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Error while updating quiz status');
      }
    );
  }

  syncAttendance() {
    this.isSync = true;
    const epSyncAttendance = this.endpoint + '/' + this.id +'/syc-attendance';
    this.api.put_withParam(null, epSyncAttendance).then(
      res => {
        if (res.success) {
          this.helper.showSuccessAlert('Success', res.message ?? 'Sync attendance success.');
          this.getById();
          setTimeout(() => {
            this.isSync = false;
          }, 500);
        }
      },
      err => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to sync attendance.');
        setTimeout(() => {
          this.isSync = false;
        }, 500);
      }
    );

  }

  async quizSettings(data?: any) {
    const tempData = {
      questionsShown: this.data?.questionsShown,
      maximalAttempts: this.data?.maximalAttempts,
      minimalPoint: this.data?.minimalPoint,
      randomizeQuizEnabled: this.data?.randomizeQuizEnabled,
    };
    const form = this.dialogService.open(PopupSettingsComponent, {
      width: '80%',
      styleClass: 'custom-dialog',
      data: {
        data: tempData,
        id: this.id
      },
      autoZIndex: false,
    });

    await firstValueFrom(form.onClose).then((res) => {
      if (res === 'success') {
        this.getById();
      }
    });
    return;
  }

  async uploadFile(data?: any) {
    const existingData = {
      logos: this.data?.logos,
      media: this.data?.media,
      document: this.data?.documents
    }
    const form = this.dialogService.open(PopupUploadComponent, {
      width: '80%',
      styleClass: 'custom-dialog',
      data: {
        id: this.id,
        data: existingData,
      },
      autoZIndex: false,
    });

    await firstValueFrom(form.onClose).then((res) => {
      if (res === 'success') {
        this.getById();
      }
    });
    return;
  }

  getAttendees(isSync: boolean = false) {
    this.isSync = true;
    const epAttend = this.endpoint + '/' + this.id +'/attendances';
    this.api.getAll(this.QueryAttend, epAttend).then(
      (res) => {
        if (res.success) {
          this.listAttendees = res.data.result.map((item: any) => {
            return {
              ...item,
              initials: item.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2),
            };
          });
          this.dateSync = new Date();
          isSync && this.helper.showSuccessAlert('Success', 'Attendance have been updated.');
        }
        setTimeout(() => {
          this.isSync = false;
        }, 500);
      },
      (err) => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Error while fetching attendees.');
        setTimeout(() => {
          this.isSync = false;
        }, 500);
      }
    );
  }

  getQuiz() {
    const epQuiz = this.endpoint + '/' + this.id +'/quiz';
    this.api.getAll(this.QueryQuiz, epQuiz).then(
      (res) => {
        if (res.success) {
          this.listQuiz = res.data.result;
        }
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Error while fetching quiz.');
      }
    );
  }

  getReview(isSync: boolean = false) {
    this.listReviews = [];
    this.isSyncReview = true;
    const epReview = this.endpoint + '/' + this.id +'/reviews';
    this.api.getAll2({}, epReview).then(
      (res) => {
        if (res.success) {
          this.listReviews = res.data;
          this.dateSyncReview = new Date();
          isSync && this.helper.showSuccessAlert('Success', 'Reviews have been updated.');
        }
        setTimeout(() => {
          this.isSyncReview = false;
        }, 500);
      },
      (err) => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Error while fetching reviews.');
        setTimeout(() => {
          this.isSyncReview = false;
        }, 500);
      }
    );
  }

  exportAttendance() {
    this.isLoadingExpAttend = true;
    const epExportAttendance = this.endpoint + '/' + this.id +'/attendances/export';
    this.api.downloadFile({}, epExportAttendance).then(
      res => {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'export_booth_absent.xlsx'); // or any other extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.helper.showSuccessAlert('Success', 'Success export attendances.');
        setTimeout(() => {
          this.isLoadingExpAttend = false;
        }, 500);
      },
      err => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to export attendances.');
        setTimeout(() => {
          this.isLoadingExpAttend = false
        }, 500);
      }
    );
  }

  exportReview() {
    this.isLoadingExpReview = true;
    const epExportReview = this.endpoint + '/' + this.id +'/reviews/export';
    this.api.downloadFile({}, epExportReview).then(
      res => {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'export_booth_rating.xlsx'); // or any other extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.helper.showSuccessAlert('Success', 'Success export reviews.');
        setTimeout(() => {
          this.isLoadingExpReview = false;
        }, 500);
      },
      err => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to export reviews.');
        setTimeout(() => {
          this.isLoadingExpReview = false;
        }, 500);
      }
    );
  }
}
