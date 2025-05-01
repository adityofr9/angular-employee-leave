import { SocketClientService } from './../../../../services/socket-client.service';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageMap } from '@ngx-pwa/local-storage';
import { DialogService } from 'primeng/dynamicdialog';
import { firstValueFrom, lastValueFrom, Subscription } from 'rxjs';
import { EventDetail } from 'src/app/api/events/event.model';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { HelperService } from 'src/app/services/helper.service';
import { PopupCreateComponent } from '../popup-create/popup-create.component';

@Component({
  selector: 'app-detail-schedule',
  templateUrl: './detail-schedule.component.html',
  styleUrls: ['./detail-schedule.component.scss']
})
export class DetailScheduleComponent implements OnInit {
  endpoint = events_endpoint.events;

  id: any;
  data:any;

  eventId: any;
  eventData: any;

  ratingValue: number = 4;
  reviewOn: boolean = true;
  liveQuestionOn: boolean = true;

  buttonActions: any[] = [
    {
      name: 'Delete Schedule',
      icon: 'pi-trash',
      slug: 'delete',
      customClass: '!bg-transparent !text-[#C42F35] border-2 !border-[#C42F35]',
    },
  ];

  listReviews: any[] = [];
  isLoadingExpReview: boolean = false;
  isSyncReview: boolean = false;

  listRawData: any[] = [];
  listQuestions: any[] = [];
  isLoadingExpQuestion: boolean = false;
  isSyncQuestions: boolean = false;

  listPinned: any[] = [];
  isSyncPinned: boolean = false;

  listSolved: any[] = [];
  isSyncSolved: boolean = false;

  dateSyncLiveQ: any = '';

  params: any;
  activeLiveQuestion: any | undefined;
  subs!: Subscription;

  today: Date = new Date();
  endDate: Date | any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: EventsService,
    private storage: StorageMap,
    private dialog: DialogService,
    public helper: HelperService,
    private socketClientService: SocketClientService,
  ) { }

  ngOnInit() {
    lastValueFrom(this.storage.get('eventData')).then((res:any)=>{
      if (res) {
        this.eventData = res;
        this.helper.setBreadcumb([
          {id:this.eventData.id, name:this.eventData.name},
        ]);

        this.endDate = this.eventData?.eventEndDate ? new Date(this.eventData?.eventEndDate) : new Date(this.eventData?.endedAt);
      }
    });

    firstValueFrom(this.route.paramMap).then((params: any) => {
      this.eventId = params.get('id');
      this.id = params.get('subId');
      this.eventId && this.id ? (this.getData(), this.scheduleSelected(this.id), this.getReview(), this.socketClientService.openConnection(this.eventId, this.id), this.listenLiveQuestion()) : this.router.navigateByUrl('u/master-event');
    });

  }


  scheduleSelected(data: any) {
    // this.socketClientService.idActive = data;
    // this.activeLiveQuestion = undefined;
    this.listPinned = [];
    this.listSolved = [];
    this.listQuestions = [];
    this.getLiveQuestion();
  }

  listenLiveQuestion() {
    this.subs = this.socketClientService.notif_chat$.subscribe((res: any) => {
      if (res) {
        let msg: any = JSON.parse(res.body);
        // console.log('[MSG]', msg);
        // console.log('[ACTIVE]', this.activeUserChat )

        if (msg.scheduleId == this.id) {
          // MARK: Check if the questions is new
          // const isNew = this.listQuestions.findIndex((item: any) => item.id == msg.id) == -1;
          const isNew = this.listRawData.findIndex((item: any) => item.id == msg.id) == -1;
          if (isNew) {
            // MARK: Set data before store into list
            const newQuestion = {
              ...msg,
              initials: msg.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2),
              labelName: this.helper.truncateText(msg?.name, 30),
              replies: msg.replies.map((child:any) => {
                return {
                  ...child,
                  initials: child.name?.split(' ').map((m: string) => m[0]).join('').substring(0, 2),
                  labelName: this.helper.truncateText(child?.name, 30)
                }
              })
            };

            // MARK: Check is questions pinned
            const existsPinned = this.listPinned.some((item: any) => item.id == msg.id);
            if (existsPinned) {
              const selectedPinned = this.listPinned.find((item: any) => item.id == msg.id);
              if (selectedPinned) {
                const indexP = this.listPinned.findIndex((item: any) => item.id == msg.id);
                if (selectedPinned.isPinned != msg.isPinned) {
                  if (!msg.isPinned) {
                    if (!msg.isSolved) {
                      this.listPinned.splice(indexP, 1);
                      const indexJ = this.listRawData.findIndex((item: any) => item.id == msg.id);
                      indexJ != -1 ? this.listPinned.splice(indexJ, 0, newQuestion) : this.listQuestions = this.insertSorted(this.listQuestions, newQuestion);
                    }
                  }
                  return;
                } else {
                  if (msg.isSolved) {
                    this.listPinned.splice(indexP, 1);
                    this.listSolved = this.insertSorted(this.listSolved, newQuestion, true);
                  }
                  return;
                }
              }
            } else {
              const existsSolved = this.listSolved.some((item: any) => item.id == msg.id);
              if (existsSolved) {
                const selectedSolved = this.listSolved.find((item: any) => item.id == msg.id);
                if (selectedSolved) {
                  const indexS = this.listSolved.findIndex((item: any) => item.id == msg.id);
                  if (selectedSolved.isSolved !== msg.isSolved) {
                    if (msg.isSolved) {
                      this.listSolved.splice(indexS, 1);
                    } else {
                      this.listSolved.splice(indexS, 1);
                      if (!msg.isPinned) {
                        this.listQuestions = this.insertSorted(this.listQuestions, newQuestion);
                      }
                    }
                    if (msg.isPinned) {
                      this.listPinned = this.insertSorted(this.listPinned, newQuestion, true);
                    }
                  }
                }
                return;
              } else {
                // MARK: Check replies
                const selectedData = this.listQuestions.find((item: any) => item.id == msg.parentId);
                if (msg.parentId) {
                  selectedData && selectedData.replies.push(newQuestion);
                } else {
                  if (!msg.isPinned && !msg.isSolved) {
                    this.listQuestions.unshift(newQuestion);
                  } else {
                    (msg.isPinned && !msg.isSolved) && this.listPinned.push(newQuestion);
                    msg.isSolved && this.listSolved.push(newQuestion);
                  }
                }

              }
            }
          } else {
            const selectedExistData = this.listQuestions.find((item: any) => item.id == msg.id);
            if (selectedExistData) {
              const index = this.listQuestions.findIndex((item: any) => item.id == msg.id);
              if (selectedExistData.isPinned != msg.isPinned) {
                if (msg.isPinned) {
                  this.listPinned.push(selectedExistData);
                  this.listQuestions.splice(index, 1);
                  // this.listPinned.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                } else {
                  if (!msg.isSolved) {
                    this.listPinned.splice(index, 1);
                  } else {
                    this.listPinned.splice(index, 1);
                    this.listQuestions.splice(index, 1);
                  }
                }

                // if (msg.isSolved) {
                //   const selectedSolved = this.listSolved.find((item: any) => item.id == msg.id);
                //   selectedSolved && (selectedSolved.isPinned = msg.isPinned);
                // }
              } else {
                if (msg.isSolved) {
                  const index = this.listPinned.findIndex((item: any) => item.id == msg.id);
                  if (msg.isPinned) {
                    this.listPinned.splice(index, 1);
                  }
                }
              }

              if (selectedExistData.isSolved != msg.isSolved) {
                if (msg.isSolved) {
                  this.listSolved.push(selectedExistData);
                  this.listQuestions.splice(index, 1);
                  // this.listSolved.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                } else {
                  const index = this.listSolved.findIndex((item: any) => item.id == msg.id);
                  this.listSolved.splice(index, 1);
                }

                if (msg.isPinned) {
                  const selectedPinned = this.listPinned.find((item: any) => item.id == msg.id);
                  selectedPinned && (selectedPinned.isSolved = msg.isSolved);
                }

              }
              selectedExistData.isPinned = msg.isPinned;
              selectedExistData.isSolved = msg.isSolved;
            }
            return;
          }
        } else {
          return;
        }
      }
    });
  }

  insertSorted(arr: any[], newData: any, isPinned: boolean = false): any[] {
    const index =  arr.findIndex(item => isPinned ? new Date(item.updatedAt) > new Date(newData.updatedAt) : new Date(item.createdAt) < new Date(newData.createdAt));
    if (index === -1) {
      arr.push(newData);
    } else {
      arr.splice(index, 0, newData);
    }
    return arr;
  }

  getData() {
    const epSchedule = `${this.endpoint}/${this.eventId}/schedule/${this.id}`;
    this.api.getAll2('', epSchedule).then(
      (res) => {
        if (res.success) {
          this.data = res.data;
          this.data.labelTitle = this.helper.truncateText(this.data.title, 55);
          this.data.labelStartTime = this.data.startTime ? this.formattedTime(this.data.startTime) : this.data.startTime;
          this.data.labelEndTime = this.data.endTime ? this.formattedTime(this.data.endTime) : this.data.endTime;
          this.reviewOn = this.data.reviewEnabled;
          this.liveQuestionOn = this.data.liveQuestionEnabled;
          setTimeout(() => {
            this.helper.setBreadcumb([
              {id:this.eventData?.id, name:this.eventData?.name},
              {id:this.id, name:res.data.title}
            ]);
          }, 300);
        } else {
          this.helper.showErrorAlert('Error', res.message ?? 'Failed to get detail schedule.');
        }
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', 'Failed to get detail schedule.');
      }
    );
  }

  getReview(isSync: boolean = false) {
    this.listReviews = [];
    this.isSyncReview = true;
    const epReview = `${this.endpoint}/${this.eventId}/schedule/${this.id}/schedule-review`;
    this.api.getAll2({}, epReview).then(
      (res) => {
        if (res.success) {
          this.listReviews = res.data;
          isSync && this.helper.showSuccessAlert('Success', 'Reviews have been updated.');
        } else {
          this.helper.showErrorAlert('Error', 'Failed to get Reviews data.');
        }
        setTimeout(() => {
          this.isSyncReview = false;
        }, 500);
      },
      (err) => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to get Reviews data.');
        setTimeout(() => {
          this.isSyncReview = false;
        }, 500);
      }
    );
  }


  toggleReview(event: any) {
    const popupData : any = {
      type: 'warning',
      title: '',
      message: 'Are you sure <br>you want to change this data?',
      button: 'Yes',
    }

    const epReview = `${this.endpoint}/${this.eventId}/schedule/${this.id}/toggle-reviews`;
    const params = {
      enabled: event.checked,
    }

    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
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
      } else {
        this.reviewOn = !this.reviewOn;
      }
    });
  }

  exportReview() {
    this.isLoadingExpReview = true;
    const epExportReview = `${this.endpoint}/${this.eventId}/schedule/${this.id}/export-review`;
    this.api.downloadFile({}, epExportReview).then(
      res => {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'export_schedule_review.xlsx'); // or any other extension
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

  deleteSchedule() {
    const popupData : any = {
      type: 'warning',
      title: '',
      message: 'Are you sure <br>you want to delete this data?',
      button: 'Yes',
    }

    const epDeleteSchedule = `${this.endpoint}/${this.eventId}/schedule`;;
    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
        this.api.delete(this.id, epDeleteSchedule).then(
          (res) => {
            if (res.success) {
              this.helper.showSuccessAlert('Deleted', 'Schedule data has been deleted.');
              this.router.navigate(['../'], { relativeTo: this.route });
            }
          },
          (err) => {
            console.log(err);
            this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to delete Schedule data.');
          }
        );
      }
    });
  }

  formattedTime(time: any) {
    const [hours, minutes] = time.split(':');
    return (`${hours}:${minutes}`);
  }

  async editData() {
    const form = this.dialog.open(PopupCreateComponent, {
      width: '80%',
      styleClass: 'custom-dialog',
      data: {
        scheduleId: this.id,
        data: this.data,
        eventId: this.eventId,
        eventData: this.eventData,
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

  async runActionBtn(slug: any) {
    if (slug.data == 'delete') {
      this.deleteSchedule();
    }
  }

  openLiveQuestion() {
    window.open(`/live/${this.eventId}/live-question/${this.id}`, '_blank');
  }

  getLiveQuestion(isSync: boolean = false) {
    this.getListQuestions(isSync);
    this.getPinnedQuestions();
    this.getSolvedQuestions();
  }

  getListQuestions(isSync: boolean = false) {
    this.listQuestions = [];
    this.isSyncQuestions = true;
    const epLiveQ = `${this.endpoint}/${this.eventId}/schedule/${this.id}/live-questions`;
    this.api.getAll2({}, epLiveQ).then(
      (res) => {
        if (res.success) {
          let response: any = res.data;
          response = response.map((item: any) => {
            return {
              ...item,
              initials: item.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2),
              labelName: this.helper.truncateText(item?.name, 30),
              replies: item.replies.map((child:any) => {
                return {
                  ...child,
                  initials: child.name?.split(' ').map((m: string) => m[0]).join('').substring(0, 2),
                  labelName: this.helper.truncateText(item?.name, 30)
                }
              })
            };
          });
          this.listRawData = response;
          this.listQuestions = response;
          this.dateSyncLiveQ = new Date();
          isSync && this.helper.showSuccessAlert('Success', 'Questions have been updated.');

        } else {
          this.helper.showErrorAlert('Error', 'Failed to get Live Questions data.');
        }
        setTimeout(() => {
          this.isSyncQuestions = false;
        }, 500);
      },
      (err) => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to get Live Questions data.');
        setTimeout(() => {
          this.isSyncQuestions = false;
        }, 500);
      }
    );
  }

  getPinnedQuestions() {
    this.listPinned = [];
    this.isSyncPinned = true;
    const epPinnedQ = `${this.endpoint}/${this.eventId}/schedule/${this.id}/live-questions/pinned`;
    this.api.getAll2({}, epPinnedQ).then(
      (res) => {
        if (res.success) {
          let response: any = res.data;
          response = response.map((item: any) => {
            return {
              ...item,
              initials: item.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2),
              labelName: this.helper.truncateText(item?.name, 30),
              replies: item.replies.map((child:any) => {
                return {
                  ...child,
                  initials: child.name?.split(' ').map((m: string) => m[0]).join('').substring(0, 2),
                  labelName: this.helper.truncateText(item?.name, 30)
                }
              })
            };
          });
          this.listPinned = response;
          this.dateSyncLiveQ = new Date();

        } else {
          this.helper.showErrorAlert('Error', 'Failed to get Pinned Questions data.');
        }
        setTimeout(() => {
          this.isSyncPinned = false;
        }, 500);
      },
      (err) => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to get Pinned Questions data.');
        setTimeout(() => {
          this.isSyncPinned = false;
        }, 500);
      }
    );
  }

  getSolvedQuestions() {
    this.listSolved = [];
    this.isSyncSolved = true;
    const epSolvedQ = `${this.endpoint}/${this.eventId}/schedule/${this.id}/live-questions/solved`;
    this.api.getAll2({}, epSolvedQ).then(
      (res) => {
        if (res.success) {
          let response: any = res.data;
          response = response.map((item: any) => {
            return {
              ...item,
              initials: item.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2),
              labelName: this.helper.truncateText(item?.name, 30),
              replies: item.replies.map((child:any) => {
                return {
                  ...child,
                  initials: child.name?.split(' ').map((m: string) => m[0]).join('').substring(0, 2),
                  labelName: this.helper.truncateText(item?.name, 30)
                }
              })
            };
          });
          this.listSolved = response;
          this.dateSyncLiveQ = new Date();

        } else {
          this.helper.showErrorAlert('Error', 'Failed to get Solved Questions data.');
        }
        setTimeout(() => {
          this.isSyncSolved = false;
        }, 500);
      },
      (err) => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to get Solved Questions data.');
        setTimeout(() => {
          this.isSyncSolved = false;
        }, 500);
      }
    );
  }

  toggleLiveQuestion(event: any) {
    const popupData : any = {
      type: 'warning',
      title: '',
      message: 'Are you sure <br>you want to change this data?',
      button: 'Yes',
    }

    const epReview = `${this.endpoint}/${this.eventId}/schedule/${this.id}/toggle-live-question`;
    const params = {
      enabled: event.checked,
    }

    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
        this.api.put_withParam(null, epReview, params).then(
          res => {
            if (res.success) {
              this.helper.showSuccessAlert('Success', res.message ?? 'Live Question status updated');
            } else {
              this.liveQuestionOn = !this.liveQuestionOn;
            }
          },
          err => {
            console.log(err);
            this.liveQuestionOn = !this.liveQuestionOn;
            this.helper.showErrorAlert('Error', err.message ?? err ?? 'Error while updating Live Question status');
          }
        );
      } else {
        this.liveQuestionOn = !this.liveQuestionOn;
      }
    });
  }

  setPinned(data: any) {
    const epPinned = `${this.endpoint}/${this.eventId}/schedule/${this.id}/live-questions/${data.id}/pin`;
    const params = {
      pin: !data?.isPinned,
    }
    this.api.put_withParam(null, epPinned, params).then(
      res => {
        if (res.success) {
          this.helper.showSuccessAlert('Success', res.message ?? 'Question pin updated');
        }
      },
      err => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Error while updating Question pin');
      }
    );
  }

  setSolved(data: any) {
    const epPinned = `${this.endpoint}/${this.eventId}/schedule/${this.id}/live-questions/${data.id}/solve`;
    const params = {
      solve: !data?.isSolved,
    }
    this.api.put_withParam(null, epPinned, params).then(
      res => {
        if (res.success) {
          this.helper.showSuccessAlert('Success', res.message ?? 'Question solve updated');
        }
      },
      err => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Error while updating Question solve');
      }
    );
  }

  exportLiveQ() {
    this.isLoadingExpQuestion = true;
    const epExpLiveQ = `${this.endpoint}/${this.eventId}/schedule/${this.id}/live-questions/export`;
    this.api.downloadFile({}, epExpLiveQ).then(
      res => {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'export_schedule_question.xlsx'); // or any other extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.helper.showSuccessAlert('Success', 'Success export Live Questions.');
        setTimeout(() => {
          this.isLoadingExpQuestion = false;
        }, 500);
      },
      err => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to export Live Questions.');
        setTimeout(() => {
          this.isLoadingExpQuestion = false;
        }, 500);
      }
    );
  }

  checkIsEventLive() {
    const currentTime = new Date();
    const startTime = new Date(this.data.date + ' ' + this.data.startTime);
    const endTime = new Date(this.data.date + ' ' + this.data.endTime);

    if (currentTime <= startTime || currentTime >= endTime) {
      const popupData : any = {
        type: 'warning',
        title: '',
        message: 'The schedule is not active right now,<br> Are you sure you want to continue?',
        button: 'Yes',
      }

      this.helper.showConfirmationAlert(popupData).then((res) => {
        if (res) {
          this.openLiveQuestion();
        }
        return;
      });
    } else {
      this.openLiveQuestion();
    }

  }
}
