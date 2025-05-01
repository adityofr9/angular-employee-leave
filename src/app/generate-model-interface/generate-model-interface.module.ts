import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenerateModelInterfaceComponent } from './generate-model-interface.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: GenerateModelInterfaceComponent },
];

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
  declarations: [GenerateModelInterfaceComponent],
})
export class GenerateModelInterfaceModule {}
