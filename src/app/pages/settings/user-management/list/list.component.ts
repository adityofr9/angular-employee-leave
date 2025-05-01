import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { UserService } from 'src/app/api/user/user.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { HelperService, Paginator, Paginator_m } from 'src/app/services/helper.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  list: any[] = [];

  paginator = Object.assign({}, Paginator);
  Query: QueryParams = Object.assign({}, QueryData);

  attributes: any[] = [];
  filterFields: any[] = [
    {
      name: 'Submit Date',
      slug: 'startDate',
      placeholder: 'Select Date',
      type: 'date-shadow',
      value: null,
    },
    {
      name: 'Status',
      slug: 'status',
      placeholder: 'Select Status',
      type: 'selected',
      value: null,
      options: [],
    },
  ];

  constructor(
    private fb: FormBuilder,
    private helper: HelperService,
    private route: ActivatedRoute,
    private api: UserService,
    private title: Title,
    private permissionsService: NgxPermissionsService
  ) { }

  ngOnInit() {
    this.Query.limit = 10;
    this.Query.sortBy = 'updatedAt';
    this.Query.direction = 'desc';
    this.initParams();
    this.getData();
  }

  initParams() {
    const param: any = this.route.snapshot.queryParams;

    if (param && Object.keys(param).length > 0) {
      const filteredParam = Object.keys(param).reduce((acc: any, key) => {
        if (param[key] !== '' && param[key] !== null) {
          acc[key] = param[key];
        }
        return acc;
      }, {});
      this.Query = { ...this.Query, ...filteredParam };
    }
  }

  getData() {
    this.Query.export = false;
    this.api.getAll(this.Query, '/users').then((res) => {
      // this.list = res.data.result;

      // if (res.attributes) {
      //   this.helper.getOptFilter(res.attributes, this.filterFields);
      // }
      // this.paginator = this.helper.convertPaginator(res.data);

      this.list = res;
    });
  }

  onPageChange(event: any) {
    this.Query.limit = event.rows;
    this.getData();
  }

  pagination(data: Paginator_m) {
    this.Query.limit = data.limit;
    this.Query.pages = data.page;
    this.getData();
  }

  showAlert() {
    this.helper.showAlert().then((res) => {
      console.log('list', res);
    });
  }

  filtered(data: any) {
    this.Query = { ...this.Query, ...data };
    this.getData();
  }

  onSearch(value: string) {
    this.Query.keyword = value;
    this.getData();
  }

}
