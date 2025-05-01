import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  forms!:FormGroup
  @Input() val:any;
  @Output() value = new EventEmitter();
  
  unsub!:Subscription;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {

    this.forms = this.fb.group({
      search:[this.val]
    })


    this.unsub = this.forms.controls['search'].valueChanges.pipe(debounceTime(800)).subscribe(value=>{
      this.value.emit(value);
    })

  }

  ngOnDestroy(): void {
    this.unsub?.unsubscribe();
  }

}
