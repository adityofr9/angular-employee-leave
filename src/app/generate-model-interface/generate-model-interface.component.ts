import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-generate-model-interface',
  templateUrl: './generate-model-interface.component.html',
  styleUrls: ['./generate-model-interface.component.scss']
})
export class GenerateModelInterfaceComponent implements OnInit {

  input:any;
  result:any;

  models: string[] = [];
  constructor() { }

  ngOnInit() {
  }

  onCOnvert(){

   const result =this.generateInterfaceFromObject(JSON.parse(this.input));

   this.models.push(result);

   const textArea = document.getElementById('tsModelOutput') as HTMLTextAreaElement;
   textArea.value = this.models.reverse().join('\n');

  // this.appendToTextArea(result);

  }


  generateInterfaceFromObject(obj: any, interfaceName: string = 'GeneratedModel'): string {
    let interfaceString = `export interface ${interfaceName} {\n`;

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        // let type = this.determineType(value);

        interfaceString += `  ${key}: ${this.getType(value,key)};\n`;
      }
    }

    interfaceString += `}\n`;
    return interfaceString;
  }

  getType(value: any, key?:any): string {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        // Jika array kosong, kembalikan tipe any[]
        return `any[]`;
      } else if (typeof value[0] === "object" && value[0] !== null) {
        // Jika elemen pertama array adalah objek, buat model baru
        const nestedModelName = key;
        const nestedModel = this.generateInterfaceFromObject(value[0], nestedModelName);
        this.models.push(nestedModel); // Simpan model dalam array
        return `${nestedModelName}[]`; // Tipe array objek
      } else {
        // Jika elemen pertama array bukan objek, kembalikan tipe elemen tersebut
        return `${this.getType(value[0])}[]`;
      }
    } else if (typeof value === "object" && value !== null) {
      // Jika objek adalah objek kosong, kembalikan any
      if (Object.keys(value).length === 0) {
        return `any`;
      }
      // Jika objek bersarang, buat model baru untuk objek nested
      const nestedModelName = key;
      const nestedModel = this.generateInterfaceFromObject(value, nestedModelName);
      this.models.push(nestedModel); // Simpan model dalam array
      return nestedModelName;
    } else if( value == null){
      return `any`;
    } else {
      // Jika tipe primitif (string, number, boolean, dll.)
      return typeof value;
    }
  }


  determineType(value: any): string {
    if (value === null) {
      return 'string | null'; // Atur null dengan tipe string | null
    }

    if (Array.isArray(value)) {
      return 'any[]'; // Anda bisa menentukan tipe yang lebih spesifik jika diperlukan
    }

    if (typeof value === 'string') {
      // Cek apakah string sesuai dengan format tanggal (DD/MM/YYYY)
      if (value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return 'string'; // Bisa diubah menjadi Date jika ingin
      }
      return 'string';
    }

    if (typeof value === 'number') {
      return 'number';
    }

    if (typeof value === 'boolean') {
      return 'boolean';
    }

    if (typeof value === 'object') {
      return 'object'; // Sesuaikan jika ada tipe objek yang lebih spesifik
    }

    return typeof value;
  }

}
