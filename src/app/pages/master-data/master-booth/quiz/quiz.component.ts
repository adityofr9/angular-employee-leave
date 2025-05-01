import { Component, OnInit } from '@angular/core';
import {
  HelperService,
  Paginator,
  Paginator_m,
} from 'src/app/services/helper.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { booths_endpoint, BoothService } from 'src/app/api/booth/booth.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements OnInit {
  endpoint = booths_endpoint.booths;

  id:any;
  boothName: any = 'Booth Name';
  expandedRows: any = {};

  listQuiz: any[] = [];
  QueryQuiz: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: 15,
      sortBy: '',
      direction: 'asc'
    }
  );
  paginator = Object.assign({}, Paginator, {
    limit: 15,
  });

  listSearch: any;

  buttonActions: any[] = [
    {
      name: 'Create',
      iconCustom: 'assets/icon/icon-plusBlue.svg',
      slug: 'create',
      customClass:
        'bg-white border-2 border-solid border-[indigo] hover:!bg-[#f3f4f6] !text-[indigo] gap-1',
    },
    {
      name: 'Import',
      iconCustom: 'assets/icon/icon-importWhite.svg',
      slug: 'import',
      customClass: 'gap-1',
    },
  ];

  forms!: FormGroup;
  isLoading: boolean = false;

  isNoAnswer: any[] = [];

  private debounceTimeout: any;
  private debounceTimeMs: number = 500; // 500ms debounce time


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: BoothService,
    private helper: HelperService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.setupForm();
    firstValueFrom(this.route.paramMap).then((params: any) => {
      this.id = params.get('id');
      this.getQuiz();
    });
  }

  // MARK: FORM UTILITIES
  // MARK: Initialize form array
  setupForm() {
    this.forms = this.fb.group({
      items: this.fb.array([])
    });
  }

  // MARK: Getter for form array
  get questionsFC() {
    return (this.forms.get('items') as FormArray);
  }

  // MARK: get form control
  getFormControl(idx: any, name: string) {
    return (this.questionsFC?.controls[idx] as FormGroup)?.controls[name];
  }

  // MARK: show error form control
  showErrorFormControl(idx: any, name: string) {
    return this.helper.showErrorFormControl(this.getFormControl(idx, name));
  }

  // MARK: get form array control options
  optionsArr(idx: any) {
    return this.questionsFC.controls[idx].get('options') as FormArray;
  }

  // MARK: get form group control options
  optionFC(idx: any, idxOption: any) {
    return this.optionsArr(idx).controls[idxOption] as FormGroup;
  }

  // MARK: show error form control options
  showErrorOption(idx: any, idxOption: any) {
    return this.helper.showErrorFormControl(this.optionFC(idx, idxOption));
  }

  // MARK: get value from answer form control
  getAnswer(idx:   any) {
    return this.questionsFC.controls[idx].get('answer')?.value;
  }

  // MARK: FORM ACTIONS
  // MARK: Add question to form array
  addQuestion(question: any, idx: number = 0) {
    const newOptions = question.options?.length === 1 ? [...question.options, ""] : question.options;
    const questionGroup = this.fb.group({
      idx: [question.orderList],
      question: [question.question, [Validators.required, Validators.maxLength(150)]],
      answer: [question.answer, [Validators.required, Validators.maxLength(100)]],
      options: this.fb.array(
        newOptions?.map(
          (option: any) => this.fb.control(option, [Validators.required, Validators.maxLength(100)])
        ) || []
      ),
    });
    // this.questions.push(questionGroup);
    this.questionsFC.insert(idx, questionGroup);
  }

  // MARK: Remove question from form array
  deleteQuiz(idx: number) {
    this.listQuiz.splice(idx, 1);
    this.questionsFC.removeAt(idx);
  }

  // MARK: Add option to form array options
  addOptions(idx: number) {
    this.optionsArr(idx).push(this.fb.control('', [Validators.required, Validators.maxLength(100)]));
  }

  // MARK: Remove option from form array
  removeOption(idx: any, idxOption: any, data: any) {
    this.checkOpts(idx);
    this.optionsArr(idx).removeAt(idxOption);
    if (this.questionsFC.controls[idx].get('answer')?.value == data?.value) {
      this.questionsFC.controls[idx].get('answer')?.setValue(null);
    }
  }

  // MARK: Restart form control options
  restartFC(idx: number) {
    const itemFC = this.questionsFC.controls[idx] as FormGroup;
    itemFC.removeControl('options');
  }

  // MARK: Get quiz data
  getQuiz(isEmptySearch: boolean = true) {
    const epQuiz = this.endpoint + '/' + this.id +'/quiz';
    this.api.getAll(this.QueryQuiz, epQuiz).then(
      (res) => {
        if (res.success) {
          this.listQuiz = [];
          this.listQuiz = res.data.result;
          // this.listSearch = res?.data?.result?.slice(0, 5).sort((a, b) => a.question.localeCompare(b.question));
          setTimeout(() => {
            this.listSearch =  this.helper.sortByKeyword(res?.data?.result, this.QueryQuiz.keyword, 'question')?.slice(0, 5);
          }, 200);
          this.listQuiz.forEach((question: any, index: number) => {
            this.addQuestion(question, index);

            // Reformat list data
            question.labelQuestion = this.helper.truncateText(question.question, 50);
            question.labelAnswer = this.helper.truncateText(question.answer, 50);
          });

          this.boothName = res.attributes[0].boothName[0];
          this.helper.setBreadcumb([{id:this.id, name:this.boothName}]);
          this.paginator = this.helper.convertPaginator(res.data, this.QueryQuiz);
        }
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Error while fetching quiz.');
      }
    );
  }

  getRow(length: number, isEdit: boolean) {
    return Math.ceil((length + (isEdit ? 1 : 0)) / 2);
  }

  async runActionBtn(slug: any) {
    if (slug.data == 'create') {
      this.addNew();
    } else if (slug.data == 'import') {
      this.importQuiz();
    }
  }

  addNew() {
    const newFile = {
      question: "",
      answer: "",
      options: ["", ""],
      status: true,
      isEdit: true,
    };
    this.listQuiz = [newFile, ...this.listQuiz];
    this.addQuestion(newFile);
    this.expandedRows[this.listQuiz[0].id] = true;
  }

  resetQuestion(idx: number) {
    const question = this.listQuiz[idx];
    const newOptions = question.options?.length === 1 ? [...question.options, ""] : question.options;
    const questionGroup = this.fb.group({
      idx: [question.orderList],
      question: [question.question, [Validators.required, Validators.maxLength(150)]],
      answer: [question.answer, [Validators.required, Validators.maxLength(100)]],
      options: this.fb.array(
        newOptions?.map(
          (option: any) => this.fb.control(option, [Validators.required, Validators.maxLength(100)])
        ) || []
      )
    });
    this.questionsFC.setControl(idx, questionGroup);
  }

  onSubmit(idx: any, idQuiz?: any) {
    this.checkOpts(idx);
    if (this.questionsFC.controls[idx].valid) {
      this.isLoading = true;
      if (!!this.questionsFC.controls[idx].value.idx && !!idQuiz) {
        this.onUpdate(this.forms.value.items[idx], idQuiz);
      } else {
        this.onCreate(this.forms.value.items[idx]);
      }
    } else {
      const errOpt = this.optionsArr(idx).controls.filter((opt: any) => opt?.errors);
      if (
        !this.questionsFC.controls[idx].get('answer')?.value
        && !!this.questionsFC.controls[idx].get('question')?.value
        && errOpt.length == 0
      ) {
        this.isNoAnswer = [...this.isNoAnswer, idx];
        this.helper.showErrorAlert('Error', 'Answer has not been selected.');
      } else {
        this.helper.showErrorAlert('Error', (!!this.questionsFC.controls[idx].value.idx && !!idQuiz) ? 'Failed to save changes.' : 'Failed to add quiz data.');
      }
    }
  }

  onDelete(idx: any, data: any) {
    const popupData : any = {
      type: 'warning',
      title: '',
      message: 'Are you sure <br>you want to delete this data?',
      button: 'Yes',
    }

    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
        if (data.id) {
          const epCreate = this.endpoint + '/' + this.id + '/quiz';
          this.api.delete(data.id, epCreate).then(
            (res) => {
              if (res.success) {
                this.helper.showSuccessAlert('Deleted', 'Quiz has been deleted.');
                this.expandedRows = {};
                this.getQuiz();
              }
            },
            (err) => {
              console.log(err);
              this.helper.showErrorAlert('Error', err.message ?? 'Failed to delete Quiz.');
            }
          );
        } else {
          this.deleteQuiz(idx);
        }
      }
    });
  }

  onSelectAnswer(idx: any, idxOption: any, event: any) {
    const options = idxOption.value;
    if (event?.checked) {
      this.questionsFC.controls[idx].get('answer')?.setValue(options);
    } else {
      this.questionsFC.controls[idx].get('answer')?.setValue(null);
    }

    const index = this.isNoAnswer.indexOf(idx);
    if (index !== -1) {
      this.isNoAnswer.splice(index, 1);
    }
  }

  onCreate(payload: any) {
    const epCreate = this.endpoint + '/' + this.id + '/quiz';
    delete payload.idx;
    payload.options = payload.options.filter((opt: any) => opt?.trim() !== '');
    this.api.post(payload, epCreate).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', 'Quiz has been created.');
          setTimeout(() => {
            this.expandedRows = {};
            this.getQuiz();
          }, 500);
        }
        this.isLoading = false;
      },
      (err) => {
        console.error(err);
        this.isLoading = false;
        this.helper.showErrorAlert('Error', err.message ?? 'Failed to create quiz data.');
      }
    );
  }

  onUpdate(payload: any, quizId: any) {
    const epUpdate = this.endpoint + '/' + this.id + '/quiz';
    delete payload.idx;
    payload.options = payload.options.filter((opt: any) => opt?.trim() !== '');
    this.api.put(quizId, payload, epUpdate).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', 'Quiz has been updated.');
          setTimeout(() => {
            this.getQuiz();
          }, 500);
        }
        this.isLoading = false;
      },
      (err) => {
        console.error(err);
        this.isLoading = false;
        this.helper.showErrorAlert('Error', err.message ?? 'Failed to update quiz data.');
      }
    );
  }

  onChangeOpt(event: any, idx: any, idxOption: any) {
    this.checkOpts(idx);
    if (!event) {
      return;
    }

    // Clear any existing timeout
    clearTimeout(this.debounceTimeout);

    // Set new timeout for debounce
    this.debounceTimeout = setTimeout(() => {
      const options = this.optionsArr(idx).value;
      const duplicateIndex = options.findIndex((opt: any, i: number) => opt?.trim() === event?.trim() && i !== idxOption);
      if (duplicateIndex !== -1) {
        const newValue = `${event?.trim()} (${duplicateIndex + 1})`;
        this.optionsArr(idx).at(idxOption).setValue(newValue);
      }

      const answerVal = this.questionsFC.controls[idx].get('answer')?.value;
      const checkExist = this.optionsArr(idx).controls.find((opt: any) => opt?.value?.trim() == answerVal?.trim());
      if (!checkExist) {
        this.questionsFC.controls[idx].get('answer')?.setValue(null);
      }
    }, this.debounceTimeMs); // Delay execution by debounceTimeMs
  }

  onStatusChange(event: any, data:any, index: any) {
    const popupData : any = {
      type: 'warning',
      title: '',
      message: 'Are you sure <br>you want to change this data?',
      button: 'Yes',
    }

    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
        if (data && data.id) {
          const epChangeStat = this.endpoint + '/' + this.id + '/quiz/' + data.id + '/toggle-status';
          const params = {
            isActive: data.status,
          }
          this.api.put_withParam(null, epChangeStat, params).then(
            res => {
              if (res.success) {
                this.helper.showSuccessAlert('Success', res.message ?? 'Quiz status updated');
                setTimeout(() => {
                  this.expandedRows = {};
                  this.getQuiz();
                }, 500);
              } else {
                this.listQuiz[index].status = !data.status;
              }
            },
            err => {
              console.error(err);
              this.listQuiz[index].status = !data.status;
              this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to update quiz status');
            }
          );
        } else {
          this.listQuiz[index].status = !data.status;
          this.helper.showErrorAlert('Error', 'Failed to update quiz status');
        }
      } else {
        this.listQuiz[index].status = !data.status;
      }
    });
  }

  // MARK: REORDER
  onRowReorder(event: any) {
    // this.questionsFC.clear();
    // this.listQuestion.forEach((question: any, index: number) => {
    //   this.addQuestion(question, index);
    // });

    const selectedData = this.listQuiz[event.dropIndex];
    const epUpdate = this.endpoint + '/' + this.id + '/quiz/' + selectedData.id + '/update-order';
    const params = {
      newOrder: Number(event.dropIndex) + 1
    };
    this.api.put_withParam(null, epUpdate, params).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', 'Quiz has been reordered.');
          setTimeout(() => {
            this.getQuiz();
          }, 500);
        }
        this.isLoading = false;
      },
      (err) => {
        console.error(err);
        this.isLoading = false;
        this.helper.showErrorAlert('Error', err.message ?? 'Failed to reorder Quiz data.');
      }
    );

  }

  downloadTemplate() {
    const epDownload = this.endpoint + '/quiz/download-template';
    this.api.downloadFile({}, epDownload).then(
      res => {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Template Quiz MIE.xlsx'); // or any other extension
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.helper.showSuccessAlert('Success', 'Template downloaded successfully');
      },
      err => {
        console.error(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to download template');
      }
    );
  }

  importQuiz() {
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
        const epImport = this.endpoint + '/' + this.id + '/quiz/import-excel';
        this.api.post_formdata(payload, epImport).then(
          res => {
            if (res.success) {
              this.helper.showSuccessAlert('Success', res.message ?? 'Successfully imported new quiz.');
            } else {
              this.helper.showErrorAlert('Error', res.message ?? 'Failed to download template.');
            }
            this.expandedRows = {};
            this.getQuiz();
          },
          err => {
            console.error(err);
            this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to download template.');
          }
        );
      }
    });

    return;
  }

  checkOpts(idx: any) {
    const optCtrl = this.optionsArr(idx).controls;
    const checkExist = optCtrl.filter((opt: any) => opt?.value?.trim() !== '');
    const checkEmpty = optCtrl.filter((opt: any) => opt?.value?.trim() === '' || opt?.value.trim() === null);
    const hasAtLeastTwoFilled = checkExist.length >= 2;
    if (checkEmpty.length > 0) {
      if (hasAtLeastTwoFilled) {
        checkEmpty.forEach((empty: any) => {
            empty.clearValidators();
            empty.updateValueAndValidity();
        });
      } else {
        checkEmpty.forEach((empty: any) => {
          empty.setErrors({ required: true });
        });
      }
    }
  }

  searchData(data: any) {
    this.QueryQuiz.keyword = data?.trim() || '';
    if (data === '' || data === null || data === undefined) {
      this.QueryQuiz.keyword = '';
      this.getQuiz(true);
    } else {
      this.getQuiz(false);
    }
  }

  navigateSelected(data: any) {
    const selectedId = data?.value?.id;
    const selectedName = data?.value?.question;
    if (selectedId && selectedName) {
      this.QueryQuiz.keyword = selectedName;
      this.getQuiz();
    }
  }

  pagination(data:Paginator_m){
    this.QueryQuiz.limit = data.limit
    this.QueryQuiz.pages = data.page
    this.getQuiz();
  }
}
