import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Status_Content_Promoted } from 'src/app/api/content/content.model';
import {
  content_endpoint,
  ContentService,
} from 'src/app/api/content/content.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import {
  HelperService,
  Paginator,
  Paginator_m,
} from 'src/app/services/helper.service';
import Swal from 'sweetalert2';
// import { Table } from 'primeng/table';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
  // @ViewChild('dt') dt!: Table;
  private eventId: string | null = null;
  list: any[] = [];
  importDialogVisible: boolean = false; // Variable to control dialog visibility

  status!: boolean;
  paginator: any;
  Query: QueryParams = Object.assign({}, QueryData);
  endpoint: any = '';

  constructor(
    private api: ContentService,
    private router: Router,
    public helper: HelperService,
    private route: ActivatedRoute,
    readonly title: Title
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('eventId');
    this.endpoint =
      content_endpoint.events + '/' + this.eventId + '/participants';
    this.initParams();
    // this.getData();
  }
  exportToCSV() {
    // if (this.dt) {
    //   this.dt.exportCSV();
    // } else {
    //   console.error('Table reference not found');
    // }
  }

  initParams() {
    const param: any = this.route.snapshot.queryParams;
    if (param) {
      this.Query = { ...QueryData, ...param };
    }
  }

  getData() {
    this.api.getAll(this.Query, this.endpoint).then((res) => {
      this.list = res.data.result;
      this.paginator = this.helper.convertPaginator(res.data, this.Query);
    });
  }

  onSearch(value: any) {
    this.Query.keyword = value;
    // this.getData();
  }

  onEdit(data: any) {
    this.router.navigateByUrl(
      `/u/master-event/${this.eventId}/${this.helper.toSlug(
        this.title.getTitle()
      )}/edit/${data.id}`
    );
  }

  // onDelete(id:string){
  //   this.api.delete(id, this.endpoint).then(res=>{
  //     if(res.success){
  //       this.helper.showSuccessAlert('Deleted',res.message);
  //       this.getData();
  //      }
  //   })
  // }

  onDelete(id: string) {
    const popupData: any = {
      type: 'delete',
      title: 'Delete Participants on this Events',
      message: 'Are you sure you want to delete this data?',
      button: 'Delete',
    };
    this.helper.showConfirmationAlert(popupData).then((res) => {
      if (res) {
        this.api.delete(id, this.endpoint).then((res) => {
          if (res.success) {
            this.helper.showSuccessAlert('Deleted', res.message);
            // this.getData();
          }
        });
      }
    });
  }

  showAlert(id: any) {}

  onPageChange(event: any) {
    this.Query.limit = event.rows;
    // this.getData();
  }

  pagination(data: any) {
    this.Query.limit = data.limit;
    this.Query.pages = data.page;
    // this.getData();
  }
  // Method to open the import dialog

  showImportDialog() {
    Swal.fire({
      title: 'Import Participants',
      html: `
        <input type="file" id="fileUpload" class="swal2-file-input" accept=".xlsx, .xls">
      `,
      showCancelButton: true,
      confirmButtonText: 'Upload',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const fileInput = document.getElementById(
          'fileUpload'
        ) as HTMLInputElement;
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          return fileInput.files[0]; // Pass the selected file to the result
        } else {
          Swal.showValidationMessage('Please select a file');
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        // Call your Angular method to handle file upload with the selected file
        this.uploadFile(result.value);
      }
    });
  }

  exportData() {
    this.Query.export = true;
    this.api.export(this.Query, this.endpoint).then((res) => {
      if (res) {
        const timestamp = new Date().toISOString().split('T')[0];
        this.helper.downloadFile(res, `Participant_${timestamp}.xls`);
        this.helper.showSuccessAlert('Success!', 'Data exported successfully');
      } else {
        this.helper.showErrorAlert('Error!', 'Failed to export data');
      }
    });
  }

  uploadFile(file: File) {
    let formData = {
      file: file,
      // content: arr,
    };
    this.api.post_formdata(formData, this.endpoint + '/import').then((res) => {
      if (res.success) {
        this.helper.showSuccessAlert('Success', res.message);
        // this.getData();
      }
    });
  }

  previousSortField: string = '';
  previousSortOrder: number = 0;

  onSort(event: any) {
    // Cek apakah field atau arah sort benar-benar berubah
    if (
      this.previousSortField !== event.field ||
      this.previousSortOrder !== event.order
    ) {
      this.Query.sortBy = event.field;
      this.Query.direction = event.order == 1 ? 'asc' : 'desc';

      // Update nilai sebelumnya untuk perbandingan di masa depan
      this.previousSortField = event.field;
      this.previousSortOrder = event.order;

      // Memanggil fungsi getData untuk mendapatkan data terbaru
      // this.getData();
    }
  }

  isMobileDevice(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor;
    const isMobileUserAgent = /android|iphone|ipad|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(userAgent);
    const isMobileScreen = window.innerWidth < 768;

    return isMobileUserAgent || isMobileScreen;
  }

  onPages() {
    if (this.isMobileDevice()) {
      return 3;
    } else {
      return 5;
    }
  }
}
