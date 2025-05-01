import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageMap } from '@ngx-pwa/local-storage';
import { firstValueFrom, lastValueFrom, Subscription } from 'rxjs';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { HelperService } from 'src/app/services/helper.service';
import { SocketClientService } from 'src/app/services/socket-client.service';

@Component({
  selector: 'app-live-question',
  templateUrl: './live-question.component.html',
  styleUrls: ['./live-question.component.scss']
})
export class LiveQuestionComponent implements OnInit {
  endpoint = events_endpoint.events;

  id: any;
  idEvent: any;
  eventData: any;

  listPinned: any[] = [];
  selectedQuestion: number = 0;
  subs!: Subscription;

  isNextLoading: boolean = false;
  isPrevLoading: boolean = false;
  isSolveLoading: boolean = false;

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private api: EventsService,
      public helper: HelperService,
      private socketClientService: SocketClientService,
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
      this.id = params.get('scheduleId');
      this.idEvent && this.id ? (this.scheduleSelected(), this.socketClientService.openConnection(this.idEvent, this.id), this.listenLiveQuestion()) : this.router.navigateByUrl('/u/master-event/' + this.idEvent);
    });
  }

  scheduleSelected() {
    this.listPinned = [];
    this.getPinnedQuestions();
  }

  listenLiveQuestion() {
    this.subs = this.socketClientService.notif_chat$.subscribe((res: any) => {
      if (res) {
        let msg: any = JSON.parse(res.body);
        // console.log('[MSG]', msg);
        // console.log('[ACTIVE]', this.activeUserChat )

        if (msg.scheduleId == this.id) {
          const isNew = this.listPinned.findIndex((item: any) => item.id == msg.id) == -1;
          const newQuestion = {
            ...msg,
            initials: msg.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2),
          };

          if (isNew) {
            (msg.isPinned && !msg.isSolved) && this.listPinned.push(newQuestion);
          } else {
            const selectedData = this.listPinned.find((item: any) => item.id == msg.id);
            if (selectedData) {
              if (selectedData.isPinned != msg.isPinned) {
                if (!msg.isPinned) {
                  if (!msg.isSolved) {
                    const index = this.listPinned.findIndex((item: any) => item.id == msg.id);
                    this.listPinned.splice(index, 1);
                  }
                }
              } else {
                if (msg.isSolved) {
                  const index = this.listPinned.findIndex((item: any) => item.id == msg.id);
                  this.listPinned.splice(index, 1);
                }
              }
            }
          }
          this.selectedQuestion = this.listPinned.length == 0 ? 0 : this.listPinned.length == this.selectedQuestion ? this.listPinned.length - 1 : this.selectedQuestion;
        } else {
          return;
        }
      }
    });
  }

  getPinnedQuestions() {
    this.listPinned = [];
    const epPinnedQ = `${this.endpoint}/${this.idEvent}/schedule/${this.id}/live-questions/pinned`;
    this.api.getAll2({}, epPinnedQ).then(
      (res) => {
        if (res.success) {
          let response: any = res.data;
          response = response.map((item: any) => {
            return {
              ...item,
              initials: item.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2),
              // labelName: this.helper.truncateText(item?.name, 30),
              // replies: item.replies.map((child:any) => {
              //   return {
              //     ...child,
              //     initials: child.name?.split(' ').map((m: string) => m[0]).join('').substring(0, 2),
              //     labelName: this.helper.truncateText(item?.name, 30)
              //   }
              // })
            };
          });
          this.listPinned = response.filter((item: any) => !item.isSolved);

        } else {
          this.helper.showErrorAlert('Error', 'Failed to get Pinned Questions data.');
        }
      },
      (err) => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to get Pinned Questions data.');
      }
    );
  }

  nextQuestion() {
    if (!this.isNextLoading) {
      this.isNextLoading = true;
      if (this.selectedQuestion < this.listPinned.length - 1) {
        setTimeout(() => {
          this.selectedQuestion++;
          this.isNextLoading = false;
        }, 300);
      }
    }
  }

  prevQuestion() {
    if (!this.isPrevLoading) {
      this.isPrevLoading = true;
      if (this.selectedQuestion > 0) {
        setTimeout(() => {
          this.selectedQuestion--;
          this.isPrevLoading = false;
        }, 200);
      }
    }
  }

  setSolved(data: any) {
    this.isSolveLoading = true;
    const epPinned = `${this.endpoint}/${this.idEvent}/schedule/${this.id}/live-questions/${data.id}/solve`;
    const params = {
      solve: !data?.isSolved,
    }
    this.api.put_withParam(null, epPinned, params).then(
      res => {
        if (res.success) {
          // this.helper.showSuccessAlert('Success', res.message ?? 'Question solve updated');
          this.isSolveLoading = false;
        }
      },
      err => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Error while updating Question solve');
        this.isSolveLoading = false;
      }
    );
  }
}
