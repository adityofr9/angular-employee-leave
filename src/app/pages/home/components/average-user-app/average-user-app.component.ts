import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { format } from 'date-fns';
import { sortBy } from 'lodash';
import { dashboard_endpoint } from 'src/app/api/dashboard/dashboard.service';
import { GeneralService } from 'src/app/api/general/general.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'average-user-app',
  templateUrl: './average-user-app.component.html',
  styleUrls: ['./average-user-app.component.scss']
})
export class AverageUserAppComponent implements OnInit {
  @Input() filter:any;


  Query = {
    startDate:'',
    endDate:'',
    export:false,
    direction:'asc',
    limit:10000000,
  }

  filterFields: any[] = [
    {
      name: '',
      slug: 'dateRange',
      placeholder: 'Select Date',
      type: 'date-range',
      value: null,
    }
  ];


  product:any[]= [
      {name:'test'},
      {name:'test2'},
      {name:'test3'},
  ]

  chart: any;



  endpoint = dashboard_endpoint.activity_user_apps;

  data?:any;

  category:any[] = []

  totalDaily:number = 0;
  totalUniq:number = 0;

  summary:any={};
  constructor(
    private helper: HelperService,
    private api:GeneralService
  ) {

  }
  ngOnInit() {
    if(this.filter){
      let start = this.filter.startDate
      let end = this.filter.endDate;
      this.filterFields[0].value = [new Date(start),new Date(end)]
      this.filtered({startDate:start,endDate:end, });
    }
  }

  filtered(data:any){

    this.Query = { ...this.Query, ...data };
    this.Query = this.helper.removeEmptyQuery(this.Query);
    // this.getData();
  }

  getData(){
    this.api.getAll(this.Query,this.endpoint).then((res:any)=>{
        if(res.success){

          let da = res.data.result
           const series = this.transformDataToSeries(da)

           if(series){
            this.totalUniq = res.data.totalUniqueId

           }

          this.initCharts(series);


        }
    })
  }

  transformDataToSeries(array:any):any {
    this.totalDaily = 0;
    this.totalUniq = 0;
    const result:any[] = [];
    const nameMapping:any = {}

    if (array.length > 0 && array[0].data) {
       let d = Object.keys(array[0].data);

       for (let i = 0; i < d.length; i++) {
         nameMapping[d[i]] = d[i].charAt(0).toUpperCase() + d[i].slice(1);
       }
    }

    array.forEach((item:any) => {

      // this.category.push(item.key);
      const formattedDate = format(new Date(item.key),'dd/MM/yyyy');
      this.category.push(formattedDate);

      const { data } = item

      for (const [key, value] of Object.entries(data)) {

        let resultItem = result.find(r => r.name === nameMapping[key]);
        if (!resultItem) {
          resultItem = {
            name: nameMapping[key],
            data: []
          };
          result.push(resultItem);
        }

        if(key == 'dailyLogin'){
          this.totalDaily = this.totalDaily + Number(value);
        }


        resultItem.data.push(value);

      }
    });

    // if(result.length === 0){
    //   this.totalDaily = 0;
    // } else {

    //   this.totalDaily = result[0].data.reduce((acc:any, item:any) => {
    //     return acc + item;
    //   }, 0);
    // }


    // this.totalUniq = result[1].data.reduce((acc:any, item:any) => {
    //   return acc + item;
    // }, 0);


    return result;



}


  initCharts(series:any) {
    this.chart  = {
        series: series,
        chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        // text: 'Product Trends by Month',
        align: 'left'
      },

      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
      },
      xaxis: {
        categories: this.category,
        labels: {
          style: {
            colors: ['#4D5562'],
            fontWeight: 'bold',
            fontSize: '14px'
          }
        }
      }
    };

  }

}
