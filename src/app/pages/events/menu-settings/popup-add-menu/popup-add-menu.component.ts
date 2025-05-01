import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { events_endpoint, EventsService } from 'src/app/api/events/events.service';
import { menus_endpoint, MenuService } from 'src/app/api/menu/menu.service';
import { UserService } from 'src/app/api/user/user.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-popup-add-menu',
  templateUrl: './popup-add-menu.component.html',
  styleUrl: './popup-add-menu.component.scss',
})
export class PopupAddMenuComponent {
  endpoint = menus_endpoint.menus;
  ep_form = events_endpoint.events;

  idEvent: any;
  listMenu: any[] = [];
  listPath: any[] = [];
  listSelected: any[] = [];

  data: any;
  mode: string = 'create';

  Query: QueryParams = Object.assign(
    {},
    QueryData,
    {
      limit: '',
      sortBy: 'name',
      direction: 'asc'
    });

  level: string[] = [];

  isLoading: boolean = false;
  isLoadingMenu: boolean = true;
  isShowPath: boolean = false;

  forms!: FormGroup;
  options = [
    { name: 'Bronze', value: 'bronze' },
    { name: 'Silver', value: 'silver' },
    { name: 'Gold', value: 'gold' },
    { name: 'Platinum', value: 'platinum' }
  ];

  constructor(
    private api: EventsService,
    private apiMenu: MenuService,
    private helper: HelperService,
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    private dialog: DynamicDialogConfig
  ) {}

  ngOnInit() {
    if (this.dialog.data) {
      this.idEvent = this.dialog.data.id ?? null;
      this.data = this.dialog.data.data ?? null;

      this.listSelected = this.dialog.data.selectedMenu ?? [];
      this.data && this.idEvent ? this.mode = 'edit' : this.mode = 'create';
      if (this.idEvent) {
        // this.getData();
        this.getPaths();
      }
    }
    this.setupForm();
  }

  setupForm() {
    this.forms = this.fb.group(
      {
        menuId: [null, Validators.required],
        formId: [null],
        accessLevel: [[]],
      }
    );
    this.data && this.forms.patchValue(this.data);
  }

  getFormControl(name: string) {
    return this.forms?.controls[name];
  }

  showErrorFormControl(name: string) {
    return this.helper.showErrorFormControl(this.getFormControl(name));
  }

  onClose(): void {
    this.ref.close();
  }

  getData() {
    this.isLoadingMenu = true;
    this.api.getAll(this.Query, this.endpoint).then(
      (res) => {
        if (res.success) {
          this.listMenu = [];
          this.listMenu = res.data.result.filter((e: any) => e.status);
          this.listMenu.forEach((menu: any) => {
            menu.disabled = this.listSelected.some((x: any) => this.data ? x === menu.id && x !== this.data?.menuId : x === menu.id);
          });
        }

        if (this.data) {
          const selectedMenu = this.listMenu.find((e) => e.id === this.data.menuId);
          if (selectedMenu && selectedMenu.slug === 'form') { // soon add another slug based on RMTM requirement B10-02
            this.isShowPath = true;
          } else {
            this.isShowPath = false;
            this.getFormControl('formId')?.reset();
          }
        }
        this.isLoadingMenu = false;
      },
      (err) => {
        console.log(err);
        this.isLoadingMenu = false;
      }
    );
  }

  getPaths() {
    const epPaths = this.ep_form + '/' + this.idEvent + '/form/active-forms';
    this.api.getAll2('', epPaths).then(
      (res) => {
        if (res.success) {
          this.listPath = res.data;
          this.listPath.forEach((e: any) => {
            e.label = this.helper.truncateText(e.title, 100);
          });
        } else {
          this.helper.showErrorAlert('Error', 'Failed to create paths data.');
        }
      },
      (err) => {
        console.log(err);
        this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to create paths data.');
      }
    );
  }

  onChangeMenu(event: any) {
    const selectedMenu = this.listMenu.find((e) => e.id === event.value);
    if (selectedMenu && selectedMenu.slug === 'form') { // soon add another slug based on RMTM requirement B10-02
      this.isShowPath = true;
    } else {
      this.isShowPath = false;
      this.getFormControl('formId')?.reset();
    }
  }

  onSubmit() {
    if (this.isLoading == false) {
      this.mode == 'create' ? this.onCreate() : this.onUpdate();
    }
  }

  onCreate() {
    this.isLoading = true;
    if (this.forms.valid) {
      const payload = this.forms.value;
      !payload.formId && delete payload.formId;
      (!payload.accessLevel || payload.accessLevel.length == 0) && delete payload.accessLevel;

      const epCreate = this.ep_form + '/' + this.idEvent + '/event-menu';
      this.api.post(payload, epCreate).then(
        (res) => {
          if (res.success) {
            this.helper.showSuccessAlert('Success', 'Menu has been added successfully.');
            this.ref.close('success');
          } else {
            this.helper.showErrorAlert('Error', 'Failed to add menu.');
          }
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
          this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to add menu.');
          this.isLoading = false;
        }
      );
    } else {
      this.helper.showErrorAlert('Error', 'Failed to add menu.');
    }
  }

  onUpdate() {
    this.isLoading = true;
    if (this.forms.valid) {
      const payload = this.forms.value;
      !payload.formId && delete payload.formId;
      (!payload.accessLevel || payload.accessLevel.length == 0) && delete payload.accessLevel;

      const epUpdate = this.ep_form + '/' + this.idEvent + '/event-menu';
      this.api.put(this.data.id, payload, epUpdate).then(
        (res) => {
          if (res.success) {
            this.helper.showSuccessAlert('Success', 'Menu setting has been updated successfully.');
            this.ref.close('success');
          } else {
            this.helper.showErrorAlert('Error', 'Failed to update menu setting.');
          }
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
          this.helper.showErrorAlert('Error', err.message ?? err ?? 'Failed to update menu setting.');
          this.isLoading = false;
        }
      );
    } else {
      this.helper.showErrorAlert('Error', 'Failed to save changes.');
    }
  }

  titlePopup() {
    return this.mode == 'edit' ? 'Edit Menu' : 'Add Menu';
  }
}
