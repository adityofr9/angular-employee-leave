import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { HelperService, Paginator, Paginator_m } from 'src/app/services/helper.service';
import { PaginatorBottomComponent } from 'src/app/shared/widgets/paginator-bottom/paginator-bottom.component';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent  implements OnInit {
  endpoint: any = events_endpoint.events;

  id:any;
  eventId: any;
  expandedRows: any = {};

  listQuestion: any[] = [];
  QueryQuestion: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: 15,
      sortBy: 'id',
      direction: 'desc'
    }
  );
  paginator = Object.assign({}, Paginator, {
    limit: 15,
  });

  buttonActions: any[] = [
    {
      name: 'Create',
      iconCustom: 'assets/icon/icon-plus.svg',
      slug: 'create',
      customClass: '',
    },
  ];

  forms!: FormGroup;
  answerTypes: any[] = [
    { name: 'Dropdown List', value: 'dropdown' },
    { name: 'Checkbox', value: 'checkbox' },
    { name: 'Radio Button', value: 'radio' },
    { name: 'Time', value: 'time' },
    { name: 'Text', value: 'text' },
    { name: 'Date', value: 'date' },
    { name: 'Date & Time', value: 'datetime' },
  ];
  isLoading: boolean = false;

  private debounceTimeout: any;
  private debounceTimeMs: number = 500; // 500ms debounce time

  listSearch: any;

  @ViewChild(PaginatorBottomComponent) paginatorBottom!: PaginatorBottomComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: EventsService,
    private helper: HelperService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.setupForm();
    firstValueFrom(this.route.paramMap).then((params: any) => {
      this.eventId = params.get('id');
      this.id = params.get('subId');

      if (this.eventId && this.id) {
        this.endpoint = this.endpoint + '/' + this.eventId + '/form';
        this.getQuestion();
      }
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

  // MARK: FORM ACTIONS
  // MARK: Add question to form array
  addQuestion(question: any, idx: number = 0) {
    const newOptions = question.options?.length === 1 ? [...question.options, ""] : question.options;

    const questionGroup = this.fb.group({
      idx: [question.orderList],
      title: [question.title, [Validators.required, Validators.maxLength(255)]],
      helper: [question.helper, [Validators.maxLength(255)]],
      answerType: [question.answerType, [Validators.required]],
      file: [question.media?.url],
      fileName: [{ value: question.media?.name, disabled: true }],
    });

    if (question.answerType && (question.answerType == 'dropdown' || question.answerType == 'checkbox' || question.answerType == 'radio')) {
      if (newOptions?.length > 0) {
        (questionGroup as FormGroup).addControl(
          'options',
          this.fb.array(
            newOptions?.map(
              (option: any) => this.fb.control(option, [Validators.required, Validators.maxLength(100)])
            ) || []
          ),
        );
      } else {
        (questionGroup as FormGroup).addControl('options', this.fb.array(
          ["",""].map((option: any) => this.fb.control(option, [Validators.required, Validators.maxLength(100)]))
        ));
      }
    }
    this.questionsFC.push(questionGroup);
    // this.questionsFC.insert(idx, questionGroup);
  }

  // MARK: Remove question from form array
  deleteQuestion(idx: number) {
    this.listQuestion.splice(idx, 1);
    this.questionsFC.removeAt(idx);
  }

  // MARK: Add option to form array options
  addOptions(idx: number) {
    const newOption = this.fb.control('', [Validators.maxLength(100)]);
    this.optionsArr(idx).push(newOption);
    setTimeout(() => {
      this.checkOpts(idx);
    }, 200);
  }

  // MARK: Remove option from form array
  removeOption(idx: any, idxOption: any, data: any) {
    this.optionsArr(idx).removeAt(idxOption);
    this.checkOpts(idx);
  }

  // MARK: Restart form control options
  restartFC(idx: number) {
    const itemFC = this.questionsFC.controls[idx] as FormGroup;
    itemFC.removeControl('options');
  }

  // MARK: Get quiz data
  getQuestion(isEmptySearch: boolean = true) {
    const epQuiz = this.endpoint + '/' + this.id +'/form-question';
    this.api.getAll(this.QueryQuestion, epQuiz).then(
      (res) => {
        if (res.success) {
          this.listQuestion = [];
          this.listQuestion = res.data.result;
          // this.listSearch = res?.data?.result?.slice(0, 5).sort((a, b) => a.title.localeCompare(b.title));
          setTimeout(() => {
            this.listSearch = this.helper.sortByKeyword(res?.data?.result, this.QueryQuestion.keyword, 'title');
          }, 200);
          this.questionsFC.clear();
          this.listQuestion.forEach((question: any, index: number) => {
            this.addQuestion(question, index);

            // Reformat list data
            question.labelQuestion = this.helper.truncateText(question.title, 55);
            question.labelHelper = this.helper.truncateText(question.helper, 20);
            question.labelAnswerType = this.answerTypes.find((e) => e.value === question.answerType)?.name;
          });

          this.listQuestion = this.listQuestion.map(question => {
            if (question.media) {
              question.media = {
                ...question.media,
              preview : question.media.url,
              type : this.helper.getTypeMedia(question.media.name)
              };
            }
            return question;
          });

          const eventName = res.attributes[0].eventName[0];
          const formName = res.attributes[0].formTitle[0];
          this.helper.setBreadcumb([
            {id:this.eventId, name:eventName},
            {id:this.id, name:formName}
          ]);
          this.paginator = this.helper.convertPaginator(res.data, this.QueryQuestion);
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
    }
  }

  addNew() {
    const newFile = {
      title: "",
      helper: "",
      answerType: null,
      options: [],
      file: null,
      fileName: "",
      status: true,
      isEdit: true,
    };

    if (this.listQuestion.length >= this.paginator.limit) {
      this.paginatorBottom.onPageChange({rows: 15, page: this.QueryQuestion.pages + 1});


      setTimeout(() => {
        this.listQuestion.push(newFile);
        this.addQuestion(newFile);
        this.expandedRows[this.listQuestion[this.listQuestion.length - 1].id] = true;
        this.resetQuestion(this.listQuestion.length - 1);
      }, 500);
    } else {
      this.listQuestion.push(newFile);
      this.addQuestion(newFile);
      this.expandedRows[this.listQuestion[this.listQuestion.length - 1].id] = true;
      this.resetQuestion(this.listQuestion.length - 1);
    }
  }

  resetQuestion(idx: number) {
    const question = this.listQuestion[idx];
    const newOptions = question.options?.length === 1 ? [...question.options, ""] : question.options;
    const questionGroup = this.fb.group({
      idx: [question.orderList],
      title: [question.title, [Validators.required, Validators.maxLength(255)]],
      helper: [question.helper, [Validators.maxLength(255)]],
      answerType: [question.answerType, [Validators.required]],
      file: [question.media?.url],
      fileName: [{ value: question.media?.name, disabled: true }],
    });

    if (question.answerType && (question.answerType == 'dropdown' || question.answerType == 'checkbox' || question.answerType == 'radio')) {
      if (newOptions?.length > 0) {
        (questionGroup as FormGroup).addControl(
          'options',
          this.fb.array(
            newOptions?.map(
              (option: any) => this.fb.control(option, [Validators.required, Validators.maxLength(100)])
            ) || []
          ),
        );
      } else {
        (questionGroup as FormGroup).addControl('options', this.fb.array(
          ["",""].map((option: any) => this.fb.control(option, [Validators.required, Validators.maxLength(100)]))
        ));
      }
    }
    this.questionsFC.setControl(idx, questionGroup);
  }

  onSubmit(idx: any, idQuestion?: any) {
    if (this.questionsFC.controls[idx].valid) {
      this.isLoading = true;

      if (!!this.questionsFC.controls[idx].value.idx && !!idQuestion) {
        this.onUpdate(this.forms.value.items[idx], idQuestion);
      } else {
        this.onCreate(this.forms.value.items[idx]);
      }
    } else {
      this.helper.showErrorAlert('Error', (!!this.questionsFC.controls[idx].value.idx && !!idQuestion) ? 'Failed to save changes.' : 'Failed to add question data.');
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
          const epDelete = this.endpoint + '/' + this.id + '/form-question';
          this.api.delete(data.id, epDelete).then(
            (res) => {
              if (res.success) {
                this.helper.showSuccessAlert('Deleted', 'Question has been deleted.');
                this.expandedRows = {};
                this.getQuestion();
              }
            },
            (err) => {
              console.log(err);
              this.helper.showErrorAlert('Error', 'Failed to delete Question.');
            }
          );
        } else {
          this.deleteQuestion(idx);
        }
      }
    });
  }

  onCreate(data: any) {
    const epCreate = this.endpoint + '/' + this.id + '/form-question/create-question';
    delete data.idx;
    data.options = data?.options?.filter((opt: any) => opt?.trim() !== '');

    const params = Object.assign({}, data);
    delete params.file;
    const payload = { file: data.file };

    this.api.post_formdata(payload, epCreate, params).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', 'Question has been created.');
          setTimeout(() => {
            this.expandedRows = {};
            this.getQuestion();
          }, 500);
        }
        this.isLoading = false;
      },
      (err) => {
        console.error(err);
        this.isLoading = false;
        this.helper.showErrorAlert('Error', err.message ?? 'Failed to create question data.');
      }
    );
  }

  onUpdate(data: any, questionId: any) {
    const epUpdate = this.endpoint + '/' + this.id + '/form-question/'+ questionId;
    delete data.idx;
    data.options = data?.options?.filter((opt: any) => opt?.trim() !== '');

    const params = Object.assign({}, data);
    delete params.file;
    if (params.options === null || params.options === undefined || params.options.length === 0) {
      params.options = null;
    }

    let payload = {};
    if (typeof data.file === 'object' && data.file instanceof File) {
    // Handle file object
      payload = { file: data.file };
    } else if (typeof data.file === 'string') {
    // Handle file URL string
      params.existingFile = data.file;
    }

    this.api.put_formdata(payload, epUpdate, params).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', 'Question has been updated.');
          setTimeout(() => {
            this.getQuestion();
          }, 500);
        }
        this.isLoading = false;
      },
      (err) => {
        console.error(err);
        this.isLoading = false;
        this.helper.showErrorAlert('Error', err.message ?? 'Failed to update Question data.');
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
    }, this.debounceTimeMs); // Delay execution by debounceTimeMs
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
          empty.markAsTouched();
          empty.markAsDirty();
        });
      }
    }
  }


  // MARK: REORDER
  onRowReorder(event: any) {
    // this.questionsFC.clear();
    // this.listQuestion.forEach((question: any, index: number) => {
    //   this.addQuestion(question, index);
    // });

    const selectedData = this.listQuestion[event.dropIndex];
    const epUpdate = this.endpoint + '/' + this.id + '/form-question/' + selectedData.id + '/update-order';
    const params = {
      newOrder: Number(event.dropIndex) + 1
    };
    this.api.put_withParam(null, epUpdate, params).then(
      res => {
        if(res){
          this.helper.showSuccessAlert('Success', 'Question has been reordered.');
          setTimeout(() => {
            this.getQuestion();
          }, 500);
        }
        this.isLoading = false;
      },
      (err) => {
        console.error(err);
        this.isLoading = false;
        this.helper.showErrorAlert('Error', err.message ?? 'Failed to reorder Question data.');
      }
    );

  }

  onChangeAnswerType(event: any, idx: any) {
    const tmpForm = this.questionsFC?.controls[idx] as FormGroup;
    if (event.value && (event.value == 'dropdown' || event.value == 'checkbox' || event.value == 'radio')) {
      tmpForm.addControl('options', this.fb.array(
        ["",""].map((option: any) => this.fb.control(option, [Validators.required, Validators.maxLength(100)]))
      ));
    } else {
      tmpForm.removeControl('options');
    }
  }

  onAddFile(event: any, idx: string) {
    if (event && event.length > 0) {
      this.getFormControl(idx, 'file')?.setValue(event[0]?.file);
      this.getFormControl(idx, 'fileName')?.setValue(event[0]?.name);
    } else {
      this.getFormControl(idx, 'file')?.reset();
      this.getFormControl(idx, 'fileName')?.reset();
    }
  }

  onExpandRow(data: any, idx: any, isExpand: boolean) {
    if (isExpand) {
      data.isEdit = false;
      this.resetQuestion(idx)
    }
  }

  pagination(data:Paginator_m){
    this.QueryQuestion.limit = data.limit
    this.QueryQuestion.pages = data.page
    this.getQuestion();
  }

  searchData(data: any) {
    this.QueryQuestion.keyword = data?.trim() || '';
    if (data === '' || data === null || data === undefined) {
      this.QueryQuestion.keyword = '';
      this.getQuestion(true);
    } else {
      this.getQuestion(false);
    }
  }

  navigateSelected(data: any) {
    const selectedId = data?.value?.id;
    const selectedName = data?.value?.title;
    if (selectedId && selectedName) {
      this.QueryQuestion.keyword = selectedName;
      this.getQuestion();
    }
  }
}
