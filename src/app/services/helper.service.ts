import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormGroup } from '@angular/forms';

import { StorageMap } from '@ngx-pwa/local-storage';
import { firstValueFrom, lastValueFrom, Subject } from 'rxjs';
import Swal from 'sweetalert2';

import { Response_data } from '../core/models/general.model';
import { Route } from '../layout/sidebar/metadata';
import { Users } from '../api/auth/auth.model';

import { PopupAlertComponent } from '../popup/popup-alert/popup-alert.component';
import { PopupWarningComponent } from '../popup/popup-warning/popup-warning.component';
import { PopupFormComponent } from '../popup/popup-form/popup-form.component';

import * as CryptoJS from 'crypto-js';
import { HttpParams } from '@angular/common/http';
import { QueryParams } from '../core/models/query-params.model';

export interface Paginator_m {
  page: number;
  limit: number;
  lastPage: number;
  totalPage: number;
}

export const Paginator = {
  page: 1,
  limit: 10,
  lastPage: 0,
  totalPage: 0,
};

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  users!: Users;

  private password = '1324576890abcdef1324576890abcdef';
  private iv = 'abcdef1324576890abcdef1324576890';

  routerData: Subject<any> = new Subject<any>();

  constructor(
    private strorage: StorageMap,
    // public dialogService: DialogService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  defaualtFilterDate() {
    const startDate = new Date(
      Date.UTC(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 30
      )
    );
    const endDate = new Date(
      Date.UTC(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      )
    );

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }
  removeEmptyQuery(Query: any) {
    Object.keys(Query).forEach((key) => {
      const typedKey = key as keyof QueryParams;
      if (
        Query[typedKey] === '' ||
        Query[typedKey] === null ||
        Query[typedKey] === undefined
      ) {
        delete Query[typedKey];
      }
      if (Query.dateRange) {
        if (Query.dateRange.startDate && Query.dateRange.endDate) {
          Query.startDate = Query.dateRange.startDate;
          Query.endDate = Query.dateRange.endDate;
        }
        delete Query.dateRange;
      }
    });

    return Query;
  }

  convertPaginator(data: Response_data, Query?: any): Paginator_m {
    if (Query) {
      this.router.navigate([], {
        relativeTo: this.route,
        // queryParams: Query,
        queryParamsHandling: 'merge', // Merge params dengan yang sudah ada
      });
    }

    return {
      page: data.currentPage!,
      limit: data.perPage!,
      lastPage: data.lastPage!,
      totalPage: data.totalItems!,
    };
  }

  replaceUrlParams(query: any) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: query,
      queryParamsHandling: 'merge', // Merge params dengan yang sudah ada
    });
  }

  setStorage(name: string, value: any) {
    return lastValueFrom(this.strorage.set(name, value));
  }

  getStorage(name: string) {
    return lastValueFrom(this.strorage.get(name));
  }

  //-----------------MARK: ALERT---->

  getInitial(name: any) {
    if (name) {
      let member_name = name.split(' ');
      if (member_name.length > 1) {
        return (
          member_name[0].charAt(0).toUpperCase() +
          member_name[1].charAt(0).toUpperCase()
        );
      } else {
        return member_name[0].charAt(0).toUpperCase();
      }
    } else {
      return '';
    }
  }

  async showSuccessAlert(title: string, text: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      showCloseButton: true,
      color: "white",
      background: "#25933D",
      width: 512,
      customClass: {
        title: '!text-[14px]',
        icon: 'border-none',
      },
      timer: 3000,
    });
    return Toast.fire({
      icon: 'success',
      iconHtml: '<span class="pi pi-check content-center shadow-none font-black text-[14px] text-[#25933D] text-center w-[24px] h-[24px] bg-white rounded-full"></span>',
      title: text
    }).then((result) => result.isConfirmed);

    // Swal.fire({
    //   icon: 'success',
    //   html: `
    //     <h4 class="text-[18px] lg:text-[24px] mb-[20px]">${title}</h4>
    //     <p class="!text-[#9DA3AE] mb-[24px]">${text}</p>
    // `,
    //   timer: 2000,
    //   showConfirmButton: false,
    // });
  }

  async showErrorAlert(title: string, text: string): Promise<boolean> {
    const Toast = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      showCloseButton: true,
      color: "white",
      background: "#C42F35",
      width: 512,
      customClass: {
        title: '!text-[14px]',
        icon: 'border-none',
      },
      timer: 8000,
    });
    return Toast.fire({
      icon: 'error',
      iconHtml: '<span class="pi pi-times content-center shadow-none font-black text-[14px] text-[#C42F35] text-center w-[24px] h-[24px] bg-white rounded-full"></span>',
      title: text
    }).then((result) => result.isConfirmed);

    // return Swal.fire({
    //   icon: 'error',
    //   html: `
    //     <h4 class="text-[18px] lg:text-[24px] mb-[20px]">${title}</h4>
    //     <p class="!text-[#9DA3AE] mb-[24px]">${text}</p>
    // `,
    //   confirmButtonText: 'Ok',
    //   confirmButtonColor: '#0072B9',
    // }).then((result) => result.isConfirmed);
  }

  async showWarningAlert(title: string, text: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      showCloseButton: true,
      color: "white",
      background: "#FFA800",
      width: 512,
      customClass: {
        title: '!text-[14px]',
        icon: 'border-none',
      },
      timer: 6000,
    });
    return Toast.fire({
      icon: 'success',
      iconHtml: '<span class="pi pi-check content-center shadow-none font-black text-[14px] text-[#25933D] text-center w-[24px] h-[24px] bg-white rounded-full"></span>',
      title: text
    }).then((result) => result.isConfirmed);
  }

  async showConfirmationAlert(data: any): Promise<boolean> {
    switch (data.type) {
      case 'delete':
        data.icon = 'assets/media/icon-delete.png';
        break;
      case 'success':
        data.icon = 'assets/media/icon-success.png';
        break;
      case 'confirm':
        data.icon = 'assets/media/icon-confirm.png';
        break;
      case 'suspend':
        data.icon = 'assets/media/icon-suspend.png';
        break;
      case 'change':
        data.icon = 'assets/media/icon-change.png';
        break;
      case 'send':
        data.icon = 'assets/media/icon-send.png';
        break;
      case 'restore':
        data.icon = 'assets/media/icon-restore.png';
        break;
      case 'warning':
        data.icon = 'assets/icon/icon-warning.svg';
        break;
      default:
        break;
    }

    return Swal.fire({
      html: `
        <img class=" ${
          data.type == 'delete' ? 'h-[100px]' : ''
        }" src="${data.icon}" alt="Icon ${data.type}" />
        <h4 class="text-[18px] lg:text-[24px] mb-5">${data.title}</h4>
        <p class="text-2xl mb-6 font-semibold">${data.message}</p>
      `,

      showCancelButton: true,
      confirmButtonText: data.button,
      cancelButtonText: data.cancelButton ?? 'Cancel',
      reverseButtons: true,
      confirmButtonColor: data.type == 'delete' ? '#D12114' : 'indigo',
      customClass: {
        cancelButton: 'custom-cancel-button !rounded-full font-bold',
        confirmButton: 'custom-confirm-button !rounded-full font-bold',
      },
    }).then((result) => result.isConfirmed);
  }

  async showAlert(stat?: any, isBulk?: any) {
    const stateData = {
      stat: stat,
      isBulkAction: isBulk,
    };

    // const alert = this.dialogService.open(PopupAlertComponent, {
    //     header: 'Select a Product',
    //     width: '320px',
    //     data: stateData,
    //     baseZIndex: 10000,
    //     maximizable: true
    // });

    let result;
    // await firstValueFrom(alert.onClose).then(res=>{
    //   return result = res;
    // })
    return result;
  }

  async showWarning(title: string, text: string) {
    // const warning = this.dialog.open(PopupWarningComponent, {
    //   width: '580px',
    //   data: { title: title, text: text },
    // });
    // const data = await lastValueFrom(warning.afterClosed());
    // return data;
  }

  async showForm(title: string, formFields: any = [], buttons: any = []) {
    // const alert = this.dialog.open(PopupFormComponent, {
    //   width: '320px',
    //   data: { title: title, formFields: formFields, buttons: buttons },
    //   disableClose: true,
    // });
    // return;
  }

  //-----MARK:Functions --->

  timeNow() {
    const utcMilliseconds = Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
      new Date().getUTCHours(),
      new Date().getUTCMinutes(),
      new Date().getUTCSeconds(),
      new Date().getUTCMilliseconds()
    );
    const time = new Date(utcMilliseconds);
    return time;
  }

  toSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s]+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  removeHTMLTags(text: string) {
    if (text) {
      return text ? text.replace(/<[^>]*>?/gm, '') : '';
    } else {
      return '';
    }
  }

  convertPermission(slug: string) {}

  findRouteByTitle(routes: Route[], title: string, depth: number = 3): any {
    if (depth < 0) return null;

    for (const route of routes) {
      if (route.title === title) {
        return route.slug;
      }

      if (route.submenu) {
        const found = this.findRouteByTitle(route.submenu, title, depth - 1);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  static findRouteByTitle(
    routes: Route[],
    title: string,
    depth: number = 3
  ): any {
    if (depth < 0) return null;

    for (const route of routes) {
      if (route.title === title) {
        return route.slug;
      }

      if (route.submenu) {
        const found = this.findRouteByTitle(route.submenu, title, depth - 1);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  mergeArray(array1: any, array2: any, byKey: string) {
    // merger array1 ke array2 , dan pertahankan array 1 jika object sama;
    const mergedArray = [...array1, ...array2].reduce(
      (acc, curr) => {
        const existing: any = acc.find(
          (item: any) => item[byKey] == curr[byKey]
        );
        if (!existing) {
          acc.push({ ...curr });
        }
        return acc;
      },
      [...array1]
    );
    return mergedArray;
  }

  findInvalidControls(form: FormGroup) {
    const invalid = [];
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  onlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  getOptFilter(attributes: any[], fields: any[]) {
    const attributesData = attributes;

    for (const key in attributesData[0]) {
      fields.map((field) => {
        if (field.type === 'selected') {
          if (field.slug === 'isSenior') {
            if ('senior' === key.toLowerCase()) {
              field.options = [];
              field.options = attributesData[0][key];
            }
          } else {
            if (
              field.slug.toLowerCase() === key.toLowerCase() ||
              field.slug.toLowerCase().includes(key.toLowerCase())
            ) {
              field.options = [];
              field.options = attributesData[0][key];
            }
          }
        }
      });
    }
  }

  public checkErrorFormControl(control: AbstractControl) {
    return (control.dirty || control.touched) && control.errors;
  }

  public showErrorFormControl(control: AbstractControl) {
    return control.invalid && (control.dirty || control.touched);
  }

  public maskStatus(status: any) {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'Draft';
      case 'OPT_APPROVED':
        return 'Waiting For Approval';
      case 'SPV_APPROVED':
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'DELETED':
        return 'Deleted';
      case 'SUSPENDED':
        return 'Suspended';
      case 'ACTIVE':
        return 'Active';
      default:
        return status
          ?.toLowerCase()
          ?.split('_')
          ?.map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  }

  downloadFile(data: any, filename: string) {
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  handleFileInput(file: any): Promise<any> {
    const selectedFile = file;

    return new Promise((resolve, reject) => {
      if (!!selectedFile) {
        // File size is more than 1 MB
        if (selectedFile.size > 2097152) {
          reject('File size must not exceed 2 MB');
        }

        const reader = new FileReader();
        // reader.readAsDataURL(file);
        // reader.readAsArrayBuffer(file);
        // reader.onload = () => resolve(reader.result as ArrayBuffer);
        // reader.onerror = () => reject('Failed to upload file');

        // const blob = new Blob([selectedFile], { type: file.type });
        // console.log('blob', blob);
        // resolve(blob);

        // For prevent file name with :upload
        const newFileName = selectedFile.name.split(':upload')[0];
        const renamedFile = new File([selectedFile], newFileName, {
          type: selectedFile.type,
        });
        resolve(renamedFile);
      } else {
        reject('Failed to upload file');
      }
    });
  }

  removedUnderscore(text: string) {
    return text
      .toLowerCase()
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Encrypt the given plaintext
   * @param plaintext - String to be encrypted
   * @returns Encrypted string in Base64 format
   */
  hashData(plaintext: string): string {
    const key = CryptoJS.enc.Hex.parse(CryptoJS.SHA256(this.password).toString());
    const iv = CryptoJS.enc.Hex.parse(CryptoJS.SHA256(this.iv).toString().substr(0, 32));
    const encrypted = CryptoJS.AES.encrypt(plaintext, key, { iv });
    return encrypted.toString();
  }

  /**
   * Decrypt the given encrypted string
   * @param encryptedData - Encrypted string in Base64 format
   * @returns Decrypted string (plaintext)
   */
  unHashData(encryptedData: string): string {
    const key = CryptoJS.enc.Hex.parse(CryptoJS.SHA256(this.password).toString());
    const iv = CryptoJS.enc.Hex.parse(CryptoJS.SHA256(this.iv).toString().substr(0, 32));
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, { iv });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  formatedUserName(fullname: string = '', lengthName: number = 1) {
    const name = fullname?.split(' ');
    let result = '';
    if (!!name) {
      if (name?.length > 1) {
        if (name[0].length > lengthName) {
          result = name[0].substring(0, lengthName);
        } else if (name[0].length == (lengthName - 2)) {
          result = name[0] + ' ' + name[1].charAt(0);
        } else if (name[1].length > (lengthName - name[0].length - 1)) {
          result = name[0] + ' ' + name[1].substring(0, (lengthName - name[0].length - 1));
        } else {
          result = name[0] + ' ' + name[1];
        }
      } else {
        result = name[0].substring(0, lengthName);
      }
    }
    return result;
  }

  isSameDate(date1: any, date2: any) {
    return new Date(date1).getDate() === new Date(date2).getDate();
  }

  urlValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null; // If the control is empty, no error
    }
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+\.[a-z.]{2,6}|[\d.]+)([\/\w.-]*)*\/?$/;
    const isValid = urlPattern.test(control.value);
    return isValid ? null : { pattern: true };
  }

  getTypeMedia(url: string) {
    if (url) {
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'tif'];
      const videoTypes = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'vob', 'ogv', 'ogg', 'drc', 'mng', 'mts', 'm2ts', 'ts', 'm4v', '3gp', '3g2'];
      const docTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'odt', 'ods', 'odp', 'odg', 'odf', 'odc', 'odb', 'odm', 'odp', 'odt', 'ott', 'ots', 'otp', 'otg', 'otf', 'oti', 'oth', 'odft', 'odt', 'odm', 'ott', 'ots', 'otp', 'otg', 'otf', 'oti', 'oth', 'odft', 'odt', 'odm', 'ott', 'ots', 'otp', 'otg', 'otf', 'oti', 'oth', 'odft', 'odt', 'odm', 'ott', 'ots', 'otp', 'otg', 'otf', 'oti', 'oth', 'odft', 'odt', 'odm', 'ott', 'ots', 'otp', 'otg', 'otf', 'oti', 'oth', 'odft', 'odt', 'odm', 'ott', 'ots', 'otp', 'otg', 'otf', 'oti', 'oth', 'odft', 'odt', 'odm', 'ott', 'ots', 'otp', 'otg', 'otf', 'oti', 'oth', 'odft', 'odt', 'odm', 'ott', 'ots', 'otp', 'otg', 'otf', 'oti', 'oth', 'odft', 'odt', 'odm', 'ott', 'ots', 'otp', 'otg', 'otf', 'oti', 'oth', 'odft', 'odt', 'odm', 'ott', 'ots', 'otp', 'otg', 'otf', 'oti', 'oth', 'odft', 'odt', 'odm', 'ott', 'ots', 'otp', 'otg', 'otf', 'oti', 'oth', 'odft', 'odt', 'odm', 'ott', 'ots', 'otp', 'otg', 'otf', 'oti', 'oth', 'odft', 'odt', 'odm', 'ott', 'ots'];
      const ext = url.split('.').pop() || '';
      if (videoTypes.includes(ext)) {
        return 'video';
      } else if (imageTypes.includes(ext)) {
        return 'image';
      } else if (docTypes.includes(ext)) {
        return 'document';
      }
    }
    return '';
  }

  renameAssignTo(item: any) {
    if (item) {
      const ext = item.split('-').pop();
      return ext.substring(0, 25);
    }
    return '';
  }

  // MARK: BreadCrumb Helper
  setBreadcumb(data:{id:string,name:string}[]) {

    let obj:any = {};
    data.forEach(x=>{
      let key = x.id.replace(/-/g, ' ');

      obj[key] = x.name;
    })

    this.routerData.next(obj);
  }

  goto(url:string,name?:string, id?:any){

    if(name){
      let param = new HttpParams({fromObject: {name:name}}).toString()
      this.router.navigateByUrl(url+'?'+param);
      this.routerData.next({id:id ?id : null  ,name:name});
    } else {
      this.router.navigate([url]);
    }
  }

  truncateText(text: string, maxLength: number): string {
    if (text) {
      if (text?.length <= maxLength) {
        return text;
      }
      return text?.substring(0, maxLength) + '...';
    } else {
      return '';
    }
  }

  // MARK: Reorder dropdown search list
  sortByKeyword(arr: any[], keyword: string, propName: keyof any) {
    return arr.sort((a, b) => {
      const lowerKeyword = keyword.toLowerCase();
      const nameA = a[propName].toLowerCase();
      const nameB = b[propName].toLowerCase();

      const startsWithA = nameA.startsWith(lowerKeyword);
      const startsWithB = nameB.startsWith(lowerKeyword);

      // Prioritaskan yang diawali keyword
      if (startsWithA && !startsWithB) return -1;
      if (!startsWithA && startsWithB) return 1;

      // Jika keduanya diawali keyword, bandingkan kata kedua dan seterusnya
      if (startsWithA && startsWithB) {
        const restA = nameA.slice(lowerKeyword.length).trim();
        const restB = nameB.slice(lowerKeyword.length).trim();

        // Jika nama setelah keyword kosong (hanya "Testing"), tetap diurutkan
        if (!restA && restB) return -1;
        if (restA && !restB) return 1;

        return restA.localeCompare(restB);
      }

      // Jika tidak ada yang diawali keyword, urutkan berdasarkan alfabet
      return nameA.localeCompare(nameB);
    });
  }
}
