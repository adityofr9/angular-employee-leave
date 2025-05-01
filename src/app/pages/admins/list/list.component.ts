import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/api/auth/auth.service';
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
  currUser: any;

  list: any[] = [];

  constructor(
    private auth: AuthService,
    private api: UserService
  ) { }

  ngOnInit() {
    this.currUser = this.auth.user.value;
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
