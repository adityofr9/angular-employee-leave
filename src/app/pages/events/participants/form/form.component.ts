import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from 'src/app/api/content/content.service';
import { general_endpoint, GeneralService } from 'src/app/api/general/general.service';
import { HelperService } from 'src/app/services/helper.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  private eventId: string | null = null;
  action!: string;

  isLoading: boolean = false;

  list:any[] = [];

  id:any;


  forms!:FormGroup;

  get(fieldName: any) {
    return this.forms.get(fieldName);
  }

  endpoint :any = '';

  type_content:any = 'image';

  files:any[]=[];
  maxFileSize = 1048576; // 1 MB dalam bytes
  maxFileSizeVideo = 1048576 * 100;; // 100 MB dalam bytes

  itemTags:any[]=[];
  itemHashtags:any[]=[];

  isSchedule:any;

  thumbnail:any;;

  limit = 10;

  constructor(
    private api: ContentService,
    public helper: HelperService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private apiGeneral: GeneralService,
    private router: Router,

    readonly title: Title
  ) { }

  ngOnInit() {
    //this.eventId = this.route.snapshot.paramMap.get('eventId');

    this.route.parent?.paramMap.subscribe((params) => {
      this.eventId = params.get('eventId');
      this.endpoint =  general_endpoint.events+'/'+this.eventId+'/participants';
    //  console.log('Event ID:', this.eventId); // Check if the eventId is being received correctly
    });

    this.forms = this.formBuilder.group({
      name: ['', [Validators.required]],
      cin: ['', [Validators.required]],
      eventId: [this.eventId]
    });

    this.id = this.route.snapshot.paramMap.get('id');


    if(this.id){
      this.getById();
    }

  }
  getById(){

    this.api.getId(this.id,this.endpoint).then(res=>{

      if (res.success) {
        res.data.name = res.data.userName;
        res.data.cin = res.data.userCin;
        const data = res.data;

        this.forms.patchValue(data);
      }
    })
  }
  /**
   * Helper method to format date to the 'YYYY-MM-DDTHH:mm' format
   */
  formatToDatetimeLocal(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    const hours = (`0${date.getHours()}`).slice(-2);
    const minutes = (`0${date.getMinutes()}`).slice(-2);

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

back(){
  this.router.navigateByUrl('/u/master-event/'+this.eventId+'/participants');
}

//MARK: - ON Submit

onSubmit(){
  let a = this.helper.findInvalidControls(this.forms);
  if(this.forms.invalid){
    this.forms.markAllAsTouched();
    return;
  }
  if(this.id){
    this.onUpdate();
    return;
  }

  this.onCreate();

}
onUpdate(){
  this.api.put(this.id,this.forms.value,this.endpoint).then(res=>{
    if(res){
      this.helper.showSuccessAlert('Updated',res.message);
      this.back();
    }
  })
}

onCreate(){
  this.api.post(this.forms.value,this.endpoint).then(res=>{
    if(res){
      this.helper.showSuccessAlert('Success',res.message);
      this.back();
     // this.router.navigateByUrl('/u/'+this.helper.toSlug(this.title.getTitle()));
    }
  })
}


getFormControl(name: string) {
 // return this.forms.get(name);
  return this.forms?.controls[name];
}

showErrorFormControl(name: string) {
  return this.helper.showErrorFormControl(this.getFormControl(name));
}
onChangeisVisible(value:any){
  if(value){
  } else {
    this.getFormControl('isVisible')?.setValue(null);
  }
}



  // MARK: - TAGs infotmation
  onRemoveTagChip(value:any){
    // console.log('value', value);

  }

  onChangeTags(value:any){
    // console.log('value', value);
  }

}
