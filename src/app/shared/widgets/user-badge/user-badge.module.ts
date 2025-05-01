import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserBadgeComponent } from './user-badge.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [UserBadgeComponent],
  exports:[UserBadgeComponent]
})
export class UserBadgeModule { }
