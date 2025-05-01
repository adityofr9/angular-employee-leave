import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Summary_m } from 'src/app/api/dashboard/dashboard.model';
import { dashboard_endpoint } from 'src/app/api/dashboard/dashboard.service';
import { GeneralService } from 'src/app/api/general/general.service';
import { QueryData, QueryParams } from 'src/app/core/models/query-params.model';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {

  @Input() filter:any;


  Query = {
    startDate:'',
    endDate:'',
    export:false,
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

  mixedChart: any;
  userByAgeChart: any;
  ChannelChart: any;
  AverageUserAppChart: any;

  store: any;
  isLoading = true;

  endpoint = dashboard_endpoint.summary;

  data?:Summary_m;



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
    this.filtered({startDate:start,endDate:end});
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
        this.data = res.data
      }
  })
}

initCharts(){

  this.mixedChart = {
    series: [{
    name: 'Solitaire',
    type: 'column',
    data: [47, 41, 3, 74, 69, 37, 49, 11, 10, 48, 64, 25]
  },
  {
    name: 'Priority',
    type: 'column',
    data: [12, 67, 49, 26, 88, 40, 59, 21, 20, 28, 44, 15]
  },
  {
    name: 'Non Member',
    type: 'column',
    data: [50, 41, 62, 18, 52, 12, 49, 31, 60, 88, 14, 35]
  },
],
    chart: {
    height: 350,
    type: 'line',
    stacked: false,
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false
  },
  colors: ['#35A1D5','#CBFDD2', '#FFF5CC'],
  stroke: {
    width: [3, 3, 3],
    colors: ['transparent']
  },
  xaxis: {
    categories: [
      'Jan 2024',
      'Feb 2024',
      'Mar 2024',
      'Apr 2024',
      'Mei 2024',
      'Jun 2024',
      'Jul 2024',
      'Aug 2024',
      'Sep 2024',
      'Oct 2024',
      'Nov 2024',
      'Dec 2024',
    ]
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'center',
    fontSize: '14px',
  }
};
}


initChartsByAge() {
  const isDark = false;
  const isRtl = false;

  this.userByAgeChart  = {
      series: [{
      data: [21, 22, 10, 28, 16, 21, 13, 30,21, 22, 10, 28, 16, 21, 13, 30,10,2]
    }],
    chart: {
      height: 380,
      zoom: {
          enabled: false,
      },
      toolbar: {
          show: false,
      },
      type: 'bar',
  },

    colors: ['#029DFD'],
    plotOptions: {
      bar: {
        columnWidth: '45%',
        distributed: true,
      }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    xaxis: {
      categories: [
          '18',
          '19',
          '20',
          '21',
          '22',
          '23',
          '24',
          '25',
          '26',
          '27',
          '28',
          '29',
          '30',
          '31',
          '32',
          '33',
          '34',
          '35',

      ],
      labels: {
        style: {
          colors: ['#000'],
          fontSize: '12px'
        }
      }
    }
    };


}

initChartsByChannel() {
  const isDark = false;
  const isRtl = false;


  this.ChannelChart = {
      series: [{
      data: [1380, 1200, 1100, 690, 580, 580, 540, 470, 448, 400, 430]
    }],
      chart: {
      type: 'bar',
      height: 420,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: 'end',
        horizontal: true,
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: [
          'Finance Insights',
          'Money Matters',
          'Wealth Wizards',
          'Smart Investing',
          'Crypto Chronicles',
          'Budgeting Basics',
          'Market Movers',
          'Financial Freedom',
          'Wealth Builders',
          'Economic Explorer'
      ],
    }
    };

}

initChartsAverageUser() {
  const isDark = false;
  const isRtl = false;


  this.AverageUserAppChart  = {
      series: [{
        name: "Desktop",
        data: [10, 41, 35, 51, 49, 62, 69, 91, 60, 88, 64, 55]
    }],
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
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    }
    };

}


}
