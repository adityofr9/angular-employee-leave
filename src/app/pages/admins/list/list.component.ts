import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/api/user/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: false
})
export class ListComponent implements OnInit {
  apiEnv: any = environment.apiUrl;

  list: any[] = [];

  constructor(
    private api: UserService
  ) { }

  ngOnInit() {
    this.getData();
  }

  getData() {
    // ?role=admin
    this.api.getAll({}, `/users`).then((res) => {
      if (res) {
        this.list = res;
      }
    });
  }

}
