import { Component, OnInit } from '@angular/core';
import { APICallsService } from '../apicalls.service';
import { Storage } from '@ionic/storage';
import { IQueueResp } from '../models/IQueueResp';
import { AlertController } from '@ionic/angular';
import { interval } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  private qResp : any[] = [];
  private clientList : any[] = [];
  email = "";
  hash = "";
  public innerWidth: any;
  public innerHeight: any;
  rowsperPage : number = 10;

  constructor(private apiService:APICallsService, private storage: Storage, public alertController: AlertController) {
    interval(6000).subscribe(x => {
      this.qResp = [];
      this.queue();
    });
  }

  ngOnInit() {
    var self = this;
    this.getData('email').then(function(value){
      self.email = value;
      self.getData('hash').then(function(value){
        self.hash = value;
        console.log(self.email, self.hash);
        self.queue();
        self.getClientInfo();
      });
    });

    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    console.log(this.innerWidth,this.innerHeight);
    this.getNumRows(this.innerHeight);
  }
  getData(data):any{
      return this.storage.get(data).then(function(value) {
      return value;
      });
    }
  getNumRows(height){
    this.rowsperPage = (height-270)/50;
  }
  public getClientInfo(){
    console.log("cancel");
    this.apiService.getClientInfo(this.email,this.hash).subscribe(
      resp => {
        //console.log("Success", resp);
        var temp : any[] = Object.keys(resp);
        temp.map((x)=>{
          this.clientList.push(resp[x]);
        });
        console.log("Client", this.clientList);
      },
      err => {
        console.log("Fail",err);
      });
  }

  public queue(){
    console.log("Admin")
    //var email = this.storage.get('email');
    //var hash = this.storage.get('hash');
    this.apiService.queue(this.email, this.hash).subscribe(
    resp => {
      var temp : any[] = Object.keys(resp);
      //this.qResp = temp;
      temp.map((x)=>{
          if(resp[x].bytes.total !=0){
            resp[x].progressbar = (resp[x].bytes.done/resp[x].bytes.total); 
          }else{
            resp[x].progressbar = 0.0;
          }

          this.qResp.push(resp[x]);
      });
      this.qResp.sort((a, b) => { return b.job_id - a.job_id});
      //console.log(this.qResp);
    },
    err => {
      console.log("Fail",err);
    });
  }

  public restartJob(jobid){
    console.log("restart",jobid);
    //var email = this.storage.get('email');
    //var hash = this.storage.get('hash');
    this.apiService.restartJob(jobid,this.email,this.hash).subscribe(
    resp => {
      console.log("Success", resp);
    },
    err => {
      console.log("Fail",err);
    });
  }

  public deleteJob(jobid){
    console.log("delete",jobid);
  }

  public cancelJob(jobid){
    console.log("cancelJob",jobid);
    this.apiService.cancelJob(jobid,this.email,this.hash).subscribe(
      resp => {
        console.log("Success", resp);
      },
      err => {
        console.log("Fail",err);
      });
  }

  async infoJob(jobid) {
    var obj = this.qResp.find(x => x.job_id == jobid);
    console.log(obj);
    var duration = ((obj.times.completed - obj.times.started)/1000).toFixed(2);
    var scheduledDate = new Date(obj.times.scheduled);
		var startedDate = new Date(obj.times.started);
    var completedDate = new Date(obj.times.completed);
    
    var msg = "<div class='alertBox'><b>Source:</b> "+obj.src.uri+"</br><b>Destination:</b> "+obj.dest.uri
              +"</br><b>Instant Speed:</b> "+this.renderSpeed(obj.bytes.inst)+"</br><b>Average Speed:</b> "+this.renderSpeed(obj.bytes.avg)
              +"</br><b>Scheduled Time:</b> "+this.getFormattedDate(scheduledDate)+"</br><b>Started Time:</b> "+this.getFormattedDate(startedDate)
              +"</br><b>Completed Time:</b> "+this.getFormattedDate(completedDate)+"</br><b>Time Duration:</b> "+duration
              +"</br><b>Attempts:</b> "+obj.attempts+"</br><b>Status:</b> "+obj.status+"</div>";
    const alert = await this.alertController.create({
      header: 'Info of JobID ['+obj.job_id+']',
      subHeader: 'User: '+obj.owner,
      message: msg,
      buttons: ['OK'],
    });
    await alert.present();
  }

  getFormattedDate(d){
		return (d.getMonth() + '/' + d.getDate() + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
	}
	renderSpeed(speedInBps){
		var displaySpeed = "";
		if(speedInBps > 1000000000){
			displaySpeed = (speedInBps/1000000000).toFixed(2) + " GB/s";
		}
		else if(speedInBps > 1000000){
			displaySpeed = (speedInBps/1000000).toFixed(2) + " MB/s";
		}
		else if(speedInBps > 1000){
			displaySpeed = (speedInBps/1000).toFixed(2) + " KB/s";
		}
		else{
			displaySpeed = speedInBps + " B/s";
		}

		return displaySpeed;
	}
}
